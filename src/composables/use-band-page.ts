import { onMounted } from 'vue';
import { useBandData } from '@/composables/use-band-data';

/**
 * The page shell's half of every /da-band view: `useBandData` plus loading it when the page opens, so any page works
 * when visited directly.
 */
export const useBandPage = () => {
	const data = useBandData();
	onMounted(() => data.load());

	return data;
};
