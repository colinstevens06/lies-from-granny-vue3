import type { MarchShowPlanningDetails } from '../forms/march-show-planning/model';
import type { MemberId } from './band-member';

// One member per registered form. Registering a form means adding its details type here, and its handler to the
// three registries (src/forms/rules.ts, src/forms/index.ts, netlify/forms/index.ts).
export type FormDetails = MarchShowPlanningDetails;
export type FormSlug = FormDetails['slug'];

export interface FormAvailability {
	startDay: string;
	endDay: string;
	practicesNeeded?: number;
	/** A booked show (`Gig.id`), or a free-text target below. */
	gigId?: number;
	targetLabel?: string;
	targetDay?: string;
}

export interface FormBase {
	id: number;
	slug: FormSlug;
	title: string;
	/** Eastern 'YYYY-MM-DD'. */
	dueDay: string;
	createdAt: string;
	closedAt?: string;
	availability?: FormAvailability;
	/** Roster order. */
	members: { member: MemberId; signedOffAt?: string }[];
}

export type Form = FormBase & { details: FormDetails };
