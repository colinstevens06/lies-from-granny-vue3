export interface Gig {
	id: number;
	name: string;
	date: string;
	text: string[];
	img: string;
	imgAlt: string;
	/** Intrinsic image dimensions, used to reserve layout space before load. */
	imgWidth?: number;
	imgHeight?: number;
	songs: string[];
}
