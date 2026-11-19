---
paths:
  - 'src/**'
---

# Frontend layering

The canonical layer rules for this repo's client code, adopted from Speed Shopper's `layering.md`, `client-store.md` and
`composables.md` on November 16, 2026 (Colin: _"the patterns are where I want to be most consistent"_). The shapes
match Speed Shopper's. Where this repo differs, § Deliberate differences says so and why. The plan that adopted them is
`planning/2026-11-da-band-layering.md`.

**`/da-band` stores** (`src/stores/`): `useMemberStore` (the session store), `useAvailabilityStore`,
`useFormStore`, `usePracticeStore`. `useBandData()` combines them for a page; `useBandPage()` adds the load on mount.

```
Service (HTTP) → Store (server state) → Composable (joins, UI/workflow state) → Component (render)
```

## The contract

| Layer          | Holds                                                    | Imports                                           | Does                                                                                                         | Never                                                                                             |
| -------------- | -------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **Service**    | Nothing (stateless)                                      | `ServiceBase`, `@models` types                    | One verb-named method per endpoint (`get*`, `post*`, `put*`, `patch*`, `delete*`); returns the response body | Imported by anything but a store. Declares types (they live in `@models`).                         |
| **Store**      | Server/entity state, its `loadState`, its save queue     | Its own service, `@models`, the session store     | Calls its service; keeps its state in sync after a write; exposes state and single-store getters             | Imports another entity store. Holds UI copy or notices. Holds drafts, steps or selections.         |
| **Composable** | UI/workflow state: drafts, selections, submit flags      | Stores, other composables, `@models`, `@utils`    | Joins and derives across stores into view-ready data; runs any change that touches two stores; owns copy     | Imports a service. Copies server data into its own `ref` (derive with `computed`).                 |
| **Component**  | Local UI state only                                      | Composables, stores (see below), `@models` types  | Renders; calls a store directly only for a single-store read or write                                        | Imports a service. Joins two stores itself. A presentational component touches no store at all.   |

- **Page views** (`src/router/views/**`) are the page shells. They load through a page composable (`useBandPage()` on
  `/da-band`) and may read stores.
- **A presentational component** (it renders what its props say: `calendar-day.vue`, `answer-cell.vue`) takes props
  and emits events. A feature component uses at most one entity store (plus the member store) for a read or a
  write. One that needs two goes through a composable: form screens use `useFormProgress`, lock-in uses `useBandData`.
- **Deriving across two stores, or across a store and static data like `shows`, is a composable's job.** Its result is
  computed in one place, never re-derived in a component. `useBandCalendar()` is the reference.

## Stores

- **One store per entity**, plus one **session store** for who is signed in (Speed Shopper's `userStore`). Entity
  stores never import each other; any of them may import the session store.
- **State changes only after the call succeeds.** A store method throws on failure; the caller shows the error inline.
  A 401 has already been handled by the service, so nobody re-handles it.
- **A store exposes state, not wording.** A failing save is `saveProblem: 'retrying' | 'reloaded'`; the composable that
  owns the page turns it into the sentence the member reads.
- **Getters that derive from one store's state belong on that store** (`openForms`, `myDays`).
- **Naming (Colin, 2026-11-16):** a variable holding a store ends in `Store` (`const formStore = useFormStore()`,
  Speed Shopper's `recipeStore`), and a store's state is named for what it holds, never repeating the store's name.
  `availabilityStore.byMember` (one row per member), not `availability.availability`; plural collections read
  naturally (`formStore.forms`, `practiceStore.practices`). Specs may call the store under test `store`.

## Composables

- Named `useX`, file `use-x.ts`, called synchronously in `setup` or another composable, never at module scope.
- Return a plain object of refs, computeds and functions, never a `reactive()` wrapper.
- DOM side effects run in `onMounted` and are cleaned up in `onUnmounted`.
- Accept reactive inputs (a ref or a getter) where the input changes.

## Deliberate differences from Speed Shopper

| Speed Shopper                                            | Here                                                     | Why                                                                                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom `Store<T>` base class, one instance per route     | Pinia stores, app lifetime                               | Keeps this small (Colin, 2026-11-16). Freshness comes from every page view loading what it shows on entry, which is what per-route lifetime buys Speed Shopper.        |
| `provide`/`inject`, with pass-through entity composables | None; import the store                                   | A Pinia store is already importable and shared, so the pass-through composable would add a file and no seam.                                                          |
| Autosave queues in composables                           | Each save queue lives in its entity store                | The store's `load()` merges around answers still pending or just saved, so the queue's pending state has to sit beside the merge.                                       |
| Services return `*Dto`s, stores map with `@models` mappers | Services return app types                                | The wire shape is the app shape today. Add a mapper in `@models` the first time they differ, called only inside the store.                                              |
| One boolean flag per operation (`isLoading`, `isSaving`) | One `loadState` (`idle`/`loading`/`ready`/`error`) per store, plus `saving` | The pages show one load state, never two loads racing in one store. Add a per-operation flag the first time a page needs one.                                          |
| Error toasts from the service base                       | Inline messages from the caller; autosave status in one toast | A failure from an action is shown where it happened. The autosave is the exception (Colin, 2026-11-18): a member tapping days can be scrolled anywhere, so `useSaveToast` (via `save-toast.vue`) shows "Saved" once per burst and save problems in a toast. The service base still never toasts. |

## Testing

- **Store specs** mock the service module and assert on state.
- **Component and view specs** use the real Pinia store and `vi.spyOn` its methods. They never mock a service.
- **Composable specs** run the composable inside an `effectScope` (`use-eastern-now.spec.ts`), or inside a mounted test
  component when it uses lifecycle hooks, with a real store.
