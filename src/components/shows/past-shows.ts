import type { Gig } from '@models/gig';

export const pastShows = [
	{
		id: 15,
		name: '#FightLikeFitz',
		date: 'July 29, 2023',
		text: [
			'Thanks to all who came out to the #FightLikeFitz benefit show!',
			'Ticket sales went to friend-of-the-band Tommy Fitzgerald to help in his fight against ALS.'
		],
		img: '/images/shows/8x10-2023-07-29.jpg',
		imgAlt: 'FightLikeFitz - July 29, 2023',
		songs: ['99 Balloons', 'The Anthem', 'Little Things', 'Sk8er Boi']
	},
	{
		id: 14,
		name: 'Petworth Porchfest',
		date: 'April 22, 2023',
		text: [
			'PorchFest was unfortunately rained out. But as they say, rain is a good thing!',
			'Rain makes corn. Corn makes whiskey.',
			'Well, you know how the rest goes...'
		],
		img: '/images/shows/Porchfest-04-22-2023.jpg',
		imgAlt: 'Petworth Porchfest - April 22'
	},
	{
		id: 13,
		name: 'The 8x10',
		date: 'March 31, 2023',
		text: [
			'Along with 5 Spot and Tom Curran, we had a sellout at the 8x10!',
			'Thanks so much to everyone who came out and made it a special night for us.',
			'And a big thanks to the <a href="https://www.the8x10.com/" target="_blank">8x10</a> for putting on and excellent evening.'
		],
		img: '/images/shows/8x10-03-31-23.jpg',
		imgAlt: 'Renegade 2020 flyer'
	},
	{
		id: 12,
		name: 'The Renegade',
		date: 'Sept. 3, 2020',
		text: [
			'The Renegade is a great spot in Arlington with a nice stage and booming sound system.',
			'We loved rocking this joint.',
			'You can watch the full show <a href="https://www.youtube.com/watch?v=JJFmEw_tpOQ&t=9694s" target="_blank">on YouTube</a>.'
		],
		img: '/images/shows/Renegade-09-03-20.jpg',
		imgAlt: 'Renegade 2020 flyer'
	},
	{
		id: 11,
		name: 'Best Buddies Fundraiser',
		date: 'Feb. 22 2020',
		text: [
			'Thanks for all who came out to support Best Buddies!',
			'It was a very fun event. We played in the back of the brewery and it was a cool environment!'
		],
		img: '/images/shows/best-buddies.jpg',
		imgAlt: 'Best Buddies flyer'
	},
	{
		id: 10,
		name: '8x10',
		date: 'Feb. 14, 2020',
		text: [
			'8x10 shows always bring a different excitement level. Thanks to everyone who came out and made the night a blast!'
		],
		img: '/images/shows/Valentines-8x10-Web-flyer.jpg',
		imgAlt: "LFG Valentine's at 8x10 flyer",
		songs: ['Flagpole Sitta', 'This Love', 'Valerie', 'Josie']
	},
	{
		id: 9,
		name: 'Sollys on U Street',
		date: 'Jan. 4, 2019',
		text: [
			'Our first show of 2020 was a blast! Thanks to all who came out. It was packed upstairs and we loved everyone singing along.'
		],
		img: '/images/shows/Sollys-Jan-2019.jpg',
		imgAlt: 'LFG guitarist and singer Nick Hermes',
		songs: ['Hey Jealousy', 'Santeria']
	},
	{
		id: 8,
		name: 'Sollys on U Street',
		date: 'Nov. 23, 2019',
		text: [
			"Our first D.C. gig. Solly's is the spot! Great stage and sound system. And a great dance floor! Was poppin."
		],
		img: '/images/shows/Sollys-11-23.jpg',
		imgAlt: 'Lies From Granny guitar player Kyle Fives',
		songs: ['Dirty Little Secret', "Killin' in the Name", 'Absolutely (Story of a Girl)', 'She Hates Me']
	},
	{
		id: 7,
		name: 'Mums',
		date: 'Oct. 19, 2019',
		text: ['Halloween songs at Mums, one of our favorite Baltimore spots.'],
		img: '/images/shows/Mums-10-19.jpg',
		imgAlt: 'Lies From Granny bass player Ben Denissen',
		songs: ['Anthem Part Two', 'Feeling This', 'Highway to Hell', 'I Put a Spell on You', 'Ghostbusters']
	},
	{
		id: 6,
		name: 'Sandlot',
		date: 'Sept. 8, 2019',
		text: ['Outside venue in Baltimore. This was our third gig in 48 hours. What a weekend!'],
		img: '/images/shows/Sandlot-9-8-19.jpg',
		imgAlt: 'Anna Stevens and Kyle Fives out front at Sandlot in Baltimore'
	},
	{
		id: 5,
		name: '8x10',
		date: 'Sept. 7, 2019',
		text: [
			"LFG's first show at the 8x10. It was a blast! 200+ attendance. Very grateful to play at such a cool venue."
		],
		img: '/images/shows/8x10-9-7-19.jpg',
		imgAlt: 'Kyle Fives and Anna Stevens rockin the 8x10 stage',
		songs: ['Rich Girl', 'Short Skirt/Long Jacket', 'Brain Stew', 'If It Makes You Happy']
	},
	{
		id: 4,
		name: 'Locust Point Festival',
		date: 'Sept. 7, 2019',
		text: ['Our first festival. Beautiful day to play outside and to be a part of a great community event.'],
		img: '/images/shows/Locust-Point-9-7-19.jpg',
		imgAlt: 'The whole Lies From Granny gang at the Locust Point Festival'
	},
	{
		id: 3,
		name: 'Mums',
		date: 'June 22, 2019',
		text: ['Mums is a great party spot in Federal Hill, Baltimore. Cash encouraged!'],
		img: '/images/shows/Mums-6-22-19.jpg',
		imgAlt: 'Colin Stevens drumming up a storm at an LFG show'
	},
	{
		id: 2,
		name: 'Sandlot',
		date: 'June 21, 2019',
		text: [
			'The first gig at Sandlot went so well they asked us back!',
			'This was a Friday happy hour - gorgeous day with great tunes.'
		],
		img: '/images/shows/Sandlot-6-21-19.jpg',
		imgAlt: 'Anna Stevens singing at the Sandlot in Baltimore'
	},
	{
		id: 1,
		name: 'Sandlot',
		date: 'June 12, 2019',
		text: [
			"This was our first show at Sandlot. It's an outdoor spot in Harbor East and is right on the water. It's hard to beat playing outside."
		],
		img: '/images/shows/Sandlot-6-12-19.jpg',
		imgAlt: 'Kyle Fives shredding the guitar at Sandlot in Baltimore'
	}
] as Gig[];
