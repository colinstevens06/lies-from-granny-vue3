import type { Gig } from '@models/gig';

export const shows = [
	{
		id: 23,
		name: 'Molloys Irish Pub',
		date: 'Sept 27, 2025',
		text: ['Back and ready to rock at Molloys!', 'Come early for the food', 'Stay late for the jams', "We're on 9-1"],
		img: '/images/zombie-head.png',
		imgAlt: 'Molloys - September 27, 2025'
	},
	{
		id: 22,
		name: 'Pickles Pub, OCMD',
		date: 'August 23, 2025',
		text: [
			"Summer's winding down, but we're not done yet!",
			'Come rock out with us for a energy-filled set at Pickles!',
			'Have you tried the Original Pickle Shot yet?',
			"If not, what have you been waiting for? And while you're at it, order a round for the band ;)"
		],
		img: '/images/shows/2025/pickles-oc-8-2025.jpg',
		imgAlt: 'Pickles Pub OCMD - September 21, 2024'
	},
	{
		id: 20,
		name: 'Pickles Pub, OCMD',
		date: 'May 24, 2025',
		text: [
			"We're stoked to make our return to Pickles Pub for Memorial Day weekend!",
			'Come the official summer kickoff party with Lies From Granny!',
			"Pickles is a great spot for dinner, so make sure to come early to get some food in your belly so you're ready for a long night of dancing!"
		],
		img: '/images/shows/2025/pickles-oc-memorial-day-2025.jpg',
		imgAlt: 'Pickles Pub OCMD - May 24, 2025'
	},
	{
		id: 19,
		name: 'Asheville, NC Benefit Show - The 8x10',
		date: 'November 23, 2024',
		text: [
			'November 22-23, The 8x10 and the Baltimore music community are proud to present two nights benefiting the Asheville, NC, music community.',
			'Over 2 nights, watch eight sets of diverse music with special guests.',
			'VIP ticket packages are available.',
			'Tickets go on sale Monday, Oct. 21 on <a href="https://the8x10.com/Tickets.html">The 8x10\'s ticket website.</a>'
		],
		img: '/images/shows/2024/asheville-benefit-8x10.jpg',
		imgAlt: 'The 8x10 - Asheville NC Benefit Show - November 22-23, 2024'
	},
	{
		id: 18,
		name: 'Halloween Show - The 8x10',
		date: 'October 26, 2024',
		text: [
			'There is no place quite like the 8x10, and we are excited to be coming back around Halloween!',
			'Get your best costume out and come rock with us at one of the best venues in Baltimore.',
			'We will post ticket information when available.'
		],
		img: '/images/zombie-head.png',
		imgAlt: 'The 8x10 - October 26, 2024'
	},
	{
		id: 17,
		name: 'Pickles Pub, OCMD',
		date: 'September 21, 2024',
		text: [
			'What a time we had at Pickles for our Ocean City debut!!!',
			"Ocean City holds a special place in our heart's, so we were thrilled to be rock at one of the best spots in town.",
			"If you're ever in OC, Pickles is a full-service bar and restaurant, so it's a great option for dinner if you're looking to fill your stomach before a night of drinkin' and dancin'!",
			"We can't wait to return in 2025!"
		],
		img: '/images/shows/Pickles-OC-9-21-24.jpg',
		imgAlt: 'Pickles Pub OCMD - September 21, 2024'
	},
	{
		id: 16,
		name: 'The 8x10',
		date: 'March 9, 2024',
		text: [
			'As always, it was a helluva time at The 8x10!',
			'You all rocked so hard - thank you so much for coming out and dancing with us! You packed the place again and we are so thankful for the support!'
		],
		img: '/images/shows/8x10-2024-03-09.jpg',
		imgAlt: 'The 8x10 - March 9, 2024'
	},
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
