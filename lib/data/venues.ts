export type CityVenues = {
  bar: string[];         // ~200–500 cap
  theatre: string[];     // ~500–2,000 cap
  concertHall: string[]; // ~2,000–10,000 cap
  arena: string[];       // ~10,000+ cap
};

export const CITY_VENUES: Record<string, CityVenues> = {
  // US - Northeast
  "New York": {
    bar: ["Bowery Electric", "Baby's All Right", "Elsewhere", "Output"],
    theatre: ["Irving Plaza", "Bowery Ballroom", "Mercury Lounge", "Le Poisson Rouge"],
    concertHall: ["Terminal 5", "Brooklyn Steel", "Radio City Music Hall", "Hammerstein Ballroom"],
    arena: ["Madison Square Garden", "Barclays Center", "UBS Arena", "Prudential Center"],
  },
  "Boston": {
    bar: ["Great Scott", "O'Brien's Pub", "The Sinclair", "Brighton Music Hall"],
    theatre: ["Paradise Rock Club", "Royale", "House of Blues", "Chevalier Theatre"],
    concertHall: ["House of Blues", "Roadrunner", "Wang Theatre", "Agganis Arena"],
    arena: ["TD Garden", "Xfinity Center", "Fenway Park", "Gillette Stadium"],
  },
  "Philadelphia": {
    bar: ["The Foundry", "Boot & Saddle", "Kung Fu Necktie", "Ortlieb's"],
    theatre: ["Theatre of Living Arts", "Union Transfer", "World Cafe Live", "The Troc"],
    concertHall: ["The Fillmore", "Franklin Music Hall", "Metropolitan Opera House", "Mann Center"],
    arena: ["Wells Fargo Center", "PPL Center", "BB&T Pavilion", "Citizens Bank Park"],
  },
  "Washington DC": {
    bar: ["DC9 Nightclub", "Comet Ping Pong", "Black Cat", "Songbyrd"],
    theatre: ["9:30 Club", "Lincoln Theatre", "Howard Theatre", "Union Stage"],
    concertHall: ["The Anthem", "The Fillmore Silver Spring", "DAR Constitution Hall", "Merriweather Post Pavilion"],
    arena: ["Capital One Arena", "MGM National Harbor", "Eagle Bank Arena", "Jiffy Lube Live"],
  },
  "Baltimore": {
    bar: ["Ottobar", "Metro Gallery", "The 8x10", "Sidebar"],
    theatre: ["Rams Head Live", "Soundstage", "Baltimore Soundstage", "An die Musik"],
    concertHall: ["Pier Six Pavilion", "MECU Pavilion", "Lyric Baltimore", "Modell Performing Arts Center"],
    arena: ["CFG Bank Arena", "Royal Farms Arena", "SECU Stadium", "Merriweather Post Pavilion"],
  },
  "Pittsburgh": {
    bar: ["Club Cafe", "Preserving Underground", "Mr. Small's", "The Smiling Moose"],
    theatre: ["Rex Theater", "Mr. Small's Theatre", "Roxian Theatre", "Altar Bar"],
    concertHall: ["Stage AE", "Petersen Events Center", "Carnegie Music Hall", "Pittsburgh Coliseum"],
    arena: ["PPG Paints Arena", "Acrisure Stadium", "PNC Park", "KeyBank Pavilion"],
  },
  "Buffalo": {
    bar: ["Mohawk Place", "Nietzsche's", "Rec Room", "Buffalo Iron Works"],
    theatre: ["Town Ballroom", "Tralf Music Hall", "Asbury Hall at Babeville", "Iron Works"],
    concertHall: ["Riviera Theatre", "Kleinhans Music Hall", "University at Buffalo Center for the Arts", "Shea's Performing Arts Center"],
    arena: ["KeyBank Center", "Darien Lake Amphitheater", "Sahlen Field", "FirstNiagara Center"],
  },
  "Hartford": {
    bar: ["The Webster", "Arch Street Tavern", "Spotlight N Rocks", "Black-Eyed Sally's"],
    theatre: ["Infinity Music Hall", "The Bushnell", "Xfinity Theatre", "Comix Roadhouse"],
    concertHall: ["Dome on the Meadow", "XFINITY Theatre", "Oakdale Theatre", "Torrington Warner Theatre"],
    arena: ["XL Center", "XFINITY Theatre", "Mohegan Sun Arena", "Foxwoods Fox Theater"],
  },
  "Providence": {
    bar: ["AS220", "The Parlour", "Dusk", "Fete Music Hall"],
    theatre: ["The Strand", "Columbus Theatre", "The Vets", "Lupo's Heartbreak Hotel"],
    concertHall: ["Veterans Memorial Auditorium", "Providence Performing Arts Center", "Dunkin Donuts Center", "Bold Point Pavilion"],
    arena: ["Amica Mutual Pavilion", "Dunkin' Donuts Center", "Providence Park", "Ryan Center"],
  },
  "Newark": {
    bar: ["Dingbatz", "The Gaslight", "McGovern's", "Bar Anticipation"],
    theatre: ["NJPAC Victoria Theater", "Crossroads at the Algonquin", "Stone Pony", "Count Basie Center"],
    concertHall: ["Prudential Hall", "New Jersey Performing Arts Center", "PNC Bank Arts Center", "Mayo Performing Arts Center"],
    arena: ["Prudential Center", "Red Bull Arena", "MetLife Stadium", "CURE Insurance Arena"],
  },

  // US - Southeast
  "Atlanta": {
    bar: ["The Earl", "Masquerade Purgatory", "Sister Louisa's", "Smith's Olde Bar"],
    theatre: ["Variety Playhouse", "Center Stage", "Terminal West", "The Loft"],
    concertHall: ["Tabernacle", "Coca-Cola Roxy", "Symphony Hall", "Chastain Park Amphitheatre"],
    arena: ["State Farm Arena", "Ameris Bank Amphitheatre", "Gas South Arena", "Mercedes-Benz Stadium"],
  },
  "Miami": {
    bar: ["Gramps", "Club Space", "Floyd Miami", "Treehouse"],
    theatre: ["The Fillmore Miami Beach", "Faena Forum", "The Ground", "Oasis Wynwood"],
    concertHall: ["Bayfront Park Amphitheater", "FPL Solar Amphitheater", "Hard Rock Live", "James L. Knight Center"],
    arena: ["Kaseya Center", "Hard Rock Stadium", "FLA Live Arena", "Amerant Bank Arena"],
  },
  "Orlando": {
    bar: ["Will's Pub", "The Social", "The Beacham", "Soundbar"],
    theatre: ["The Social", "Plaza Live", "Dr. Phillips Center", "The Velvet"],
    concertHall: ["House of Blues", "Hard Rock Live", "Addition Financial Arena", "Amway Center"],
    arena: ["Kia Center", "Addition Financial Arena", "Camping World Stadium", "CFE Arena"],
  },
  "Tampa": {
    bar: ["Crowbar", "The Bricks", "Orpheum", "The Hub"],
    theatre: ["Jannus Live", "Ybor City Amphitheatre", "The Palladium", "Skipper's Smokehouse"],
    concertHall: ["The Ritz Ybor", "Seminole Hard Rock Tampa", "Ruth Eckerd Hall", "MidFlorida Credit Union Amphitheatre"],
    arena: ["Amalie Arena", "MidFlorida Credit Union Amphitheatre", "Tropicana Field", "Raymond James Stadium"],
  },
  "Charlotte": {
    bar: ["Snug Harbor", "The Milestone Club", "Visulite Theatre", "Petra's"],
    theatre: ["Neighborhood Theatre", "The Underground", "McGlohon Theatre", "Visulite Theatre"],
    concertHall: ["The Fillmore Charlotte", "Ovens Auditorium", "Bojangles Coliseum", "PNC Music Pavilion"],
    arena: ["Spectrum Center", "Bank of America Stadium", "Cabarrus Arena", "Truist Field"],
  },
  "Nashville": {
    bar: ["The 5 Spot", "Springwater Supper Club", "Exit/In", "Acme Feed & Seed"],
    theatre: ["Cannery Ballroom", "Marathon Music Works", "Mercy Lounge", "City Winery"],
    concertHall: ["Ryman Auditorium", "Brooklyn Bowl Nashville", "Ascend Amphitheater", "War Memorial Auditorium"],
    arena: ["Bridgestone Arena", "Geodis Park", "FirstBank Amphitheater", "Nashville Municipal Auditorium"],
  },
  "New Orleans": {
    bar: ["Mimi's in the Marigny", "Maple Leaf Bar", "d.b.a.", "Bullet's Sports Bar"],
    theatre: ["Tipitina's", "House of Blues", "The Joy Theater", "Civic Theatre"],
    concertHall: ["Saenger Theatre", "UNO Lakefront Arena", "Mahalia Jackson Theater", "Champions Square"],
    arena: ["Smoothie King Center", "Caesars Superdome", "UNO Lakefront Arena", "Bayou Country Superfest"],
  },
  "Memphis": {
    bar: ["Young Avenue Deli", "Growlers", "Bar DKDC", "Lamplighter Lounge"],
    theatre: ["New Daisy Theatre", "Minglewood Hall", "Levitt Shell", "Halloran Centre"],
    concertHall: ["Minglewood Hall", "Orpheum Theatre", "Cannon Center", "AutoZone Park"],
    arena: ["FedExForum", "Liberty Bowl Memorial Stadium", "Mid-South Coliseum", "Agricenter International"],
  },
  "Richmond": {
    bar: ["Balliceaux", "Strange Matter", "Capital Ale House", "The Camel"],
    theatre: ["The National", "The Broadberry", "Tin Pan", "Dogtown Roadhouse"],
    concertHall: ["Dominion Energy Center", "Brown's Island Amphitheater", "Altria Theater", "Innsbrook After Hours"],
    arena: ["Atlantic Union Bank Center", "Richmond Coliseum", "Bon Secours Training Center", "Colonial Downs"],
  },
  "Raleigh": {
    bar: ["Pour House", "Kings", "The Pinhook", "Slim's Downtown"],
    theatre: ["Lincoln Theatre", "Cat's Cradle", "Motorco Music Hall", "DPAC"],
    concertHall: ["The Ritz", "Red Hat Amphitheater", "Booth Amphitheatre", "Martin Marietta Center"],
    arena: ["PNC Arena", "Coastal Credit Union Music Park", "Dorton Arena", "Carter-Finley Stadium"],
  },
  "Jacksonville": {
    bar: ["Jack Rabbits", "The Underbelly", "Mavericks", "Eclipse"],
    theatre: ["Florida Theatre", "Murray Hill Theatre", "Venue 578", "Sun-Ray Cinema"],
    concertHall: ["Daily's Place", "Times-Union Center", "Moran Theater", "Florida Theatre"],
    arena: ["VyStar Veterans Memorial Arena", "TIAA Bank Field", "Daily's Place", "Baseball Grounds of Jacksonville"],
  },
  "Louisville": {
    bar: ["Zanzabar", "Mag Bar", "The Whirling Tiger", "Headliners Music Hall"],
    theatre: ["Headliners Music Hall", "Mercury Ballroom", "The Louisville Palace", "Iroquois Amphitheater"],
    concertHall: ["Palace Theatre", "Brown Theatre", "Whitney Hall", "Old Forester's Paristown Hall"],
    arena: ["KFC Yum! Center", "Lynn Family Stadium", "Louisville Slugger Field", "Freedom Hall"],
  },
  "Birmingham": {
    bar: ["Saturn", "Lou's Pub", "The Nick", "The Syndicate"],
    theatre: ["Iron City", "The Alabama Theatre", "Avondale Brewing Company", "WorkPlay Theatre"],
    concertHall: ["Avondale Brewing Company", "BJCC Concert Hall", "Pelham Civic Complex", "Oak Mountain Amphitheatre"],
    arena: ["Legacy Arena", "Protective Stadium", "Oak Mountain Amphitheatre", "BJCC"],
  },
  "Columbia": {
    bar: ["New Brookland Tavern", "Art Bar", "Gervais & Vine", "The Conundrum"],
    theatre: ["Tin Roof", "The Senate", "Workshop Theatre", "Koger Center"],
    concertHall: ["Township Auditorium", "Colonial Life Arena", "Koger Center for the Arts", "Spring Theatre"],
    arena: ["Colonial Life Arena", "Segra Park", "Williams-Brice Stadium", "Carolina Coliseum"],
  },
  "Savannah": {
    bar: ["El Rocko Lounge", "Congress Street Social Club", "Pinkie Masters", "Malone's Bar and Grill"],
    theatre: ["Savannah Theatre", "Jinx", "Victory North", "The Stage on Bay"],
    concertHall: ["Johnny Mercer Theatre", "Lucas Theatre", "Enmarket Arena", "Forsyth Park Amphitheatre"],
    arena: ["Enmarket Arena", "Grayson Stadium", "Savannah Civic Center", "Georgia Southern Hanner Fieldhouse"],
  },

  // US - Midwest
  "Chicago": {
    bar: ["Empty Bottle", "Smartbar", "Berlin Nightclub", "Schubas Tavern"],
    theatre: ["Metro", "Park West", "Vic Theatre", "Thalia Hall"],
    concertHall: ["Riviera Theatre", "The Chicago Theatre", "Auditorium Theatre", "Aragon Ballroom"],
    arena: ["United Center", "Wintrust Arena", "Allstate Arena", "Hollywood Casino Amphitheatre"],
  },
  "Detroit": {
    bar: ["The Shelter", "Marble Bar", "TV Lounge", "UFO Factory"],
    theatre: ["St. Andrew's Hall", "The Majestic Theatre", "Crofoot Ballroom", "Magic Stick"],
    concertHall: ["Michigan Theatre", "Fox Theatre", "Masonic Temple Theatre", "DTE Energy Music Theatre"],
    arena: ["Little Caesars Arena", "Pine Knob Music Theatre", "Michigan Lottery Amphitheatre", "Ford Field"],
  },
  "Minneapolis": {
    bar: ["7th Street Entry", "The Turf Club", "Icehouse", "Hexagon Bar"],
    theatre: ["First Avenue", "Palace Theatre", "Cedar Cultural Centre", "Varsity Theater"],
    concertHall: ["The Armory", "Orpheum Theatre", "State Theatre", "Xcel Energy Center"],
    arena: ["Target Center", "Allianz Field", "U.S. Bank Stadium", "Mystic Lake Amphitheater"],
  },
  "Cleveland": {
    bar: ["Grog Shop", "Now That's Class", "Beachland Tavern", "Mahall's"],
    theatre: ["House of Blues", "Beachland Ballroom", "Agora Theatre", "The Roxy"],
    concertHall: ["Agora Theatre", "Playhouse Square", "State Theatre", "KeyBank Pavilion"],
    arena: ["Rocket Mortgage FieldHouse", "Blossom Music Center", "Jacobs Pavilion at Nautica", "Progressive Field"],
  },
  "Cincinnati": {
    bar: ["MOTR Pub", "Northside Tavern", "The Comet", "Fountain Square"],
    theatre: ["Bogart's", "20th Century Theater", "Madison Theater", "Memorial Hall"],
    concertHall: ["Taft Theatre", "Riverbend Music Center", "PNC Pavilion", "The Andrew J. Brady Music Center"],
    arena: ["Heritage Bank Center", "Riverbend Music Center", "Great American Ball Park", "Paycor Stadium"],
  },
  "Indianapolis": {
    bar: ["HI-FI", "Hoosier Dome", "Radio Radio", "Melody Inn"],
    theatre: ["Egyptian Room", "Old National Centre", "Murat Theatre", "The Vogue"],
    concertHall: ["The Murat Theatre", "Clowes Memorial Hall", "TCU Amphitheater at White River State Park", "Palladium at the Center for the Performing Arts"],
    arena: ["Gainbridge Fieldhouse", "Lucas Oil Stadium", "Ruoff Music Center", "Farmers Coliseum"],
  },
  "Columbus": {
    bar: ["Ace of Cups", "The Basement", "Double Happiness", "Brothers Drake Meadery"],
    theatre: ["Newport Music Hall", "The Basement", "A&R Bar", "Skully's Music Diner"],
    concertHall: ["Express Live!", "PromoWest Pavilion at Ovation", "Ohio Theatre", "Palace Theatre"],
    arena: ["Nationwide Arena", "Schottenstein Center", "Kemba Live!", "Historic Crew Stadium"],
  },
  "Milwaukee": {
    bar: ["Cactus Club", "The Rave/Eagles Club", "Shank Hall", "Company Brewing"],
    theatre: ["The Pabst Theater", "Turner Hall Ballroom", "Riverside Theater", "Miller High Life Theatre"],
    concertHall: ["Riverside Theater", "Miller High Life Theatre", "Marcus Performing Arts Center", "American Family Insurance Amphitheater"],
    arena: ["Fiserv Forum", "American Family Insurance Amphitheater", "American Family Field", "UWM Panther Arena"],
  },
  "Kansas City": {
    bar: ["recordBar", "The Brick", "Czar Bar", "The Rino"],
    theatre: ["The Truman", "Knuckleheads Saloon", "Uptown Theater", "Madrid Theatre"],
    concertHall: ["Uptown Theater", "Arvest Bank Theatre at the Midland", "Kauffman Center", "Starlight Theatre"],
    arena: ["T-Mobile Center", "Starlight Theatre", "Arrowhead Stadium", "Children's Mercy Park"],
  },
  "St. Louis": {
    bar: ["The Firebird", "Plush", "The Dark Room", "Fubar"],
    theatre: ["Delmar Hall", "Old Rock House", "Pageant", "Blueberry Hill Duck Room"],
    concertHall: ["The Pageant", "Stifel Theatre", "Fox Theatre", "Hollywood Casino Amphitheatre"],
    arena: ["Enterprise Center", "Hollywood Casino Amphitheatre", "Busch Stadium", "The Factory"],
  },
  "Omaha": {
    bar: ["The Waiting Room", "Reverb Lounge", "Benson Theatre", "O'Leaver's"],
    theatre: ["Slowdown", "The Waiting Room Lounge", "Sokol Auditorium", "Steelhouse Omaha"],
    concertHall: ["Orpheum Theater", "Steelhouse Omaha", "Holland Performing Arts Center", "Baxter Arena"],
    arena: ["CHI Health Center", "Pinnacle Bank Arena", "TD Ameritrade Park", "Werner Park"],
  },
  "Des Moines": {
    bar: ["Vaudeville Mews", "Lefty's Live Music", "The Basement", "Nitefall on the River"],
    theatre: ["Wooly's", "Hoyt Sherman Place", "Civic Center of Greater Des Moines", "Ingersoll Dinner Theatre"],
    concertHall: ["Hoyt Sherman Place", "Des Moines Civic Center", "Iowa Events Center", "Principal Park"],
    arena: ["Wells Fargo Arena", "Vibrant Music Hall", "Iowa State Center Hilton Coliseum", "Principal Park"],
  },
  "Madison": {
    bar: ["Mickey's Tavern", "The Frequency", "Willy Street Co-op", "Der Rathskeller"],
    theatre: ["Barrymore Theatre", "High Noon Saloon", "The Majestic Theatre", "Overture Center"],
    concertHall: ["The Orpheum", "Overture Center", "Alliant Energy Center", "Breese Stevens Field"],
    arena: ["Kohl Center", "Alliant Energy Center", "Camp Randall Stadium", "Henry Vilas Zoo"],
  },

  // US - Southwest
  "Dallas": {
    bar: ["Three Links", "It'll Do Club", "Club Dada", "The Prophet Bar"],
    theatre: ["House of Blues", "Granada Theater", "Trees", "The Bomb Factory"],
    concertHall: ["South Side Ballroom", "Dos Equis Pavilion", "Majestic Theatre", "Gilley's Dallas"],
    arena: ["American Airlines Center", "Dos Equis Pavilion", "Globe Life Field", "AT&T Stadium"],
  },
  "Houston": {
    bar: ["White Oak Music Hall (Downstairs)", "Rudyard's", "Satellite Bar", "Last Concert Cafe"],
    theatre: ["House of Blues", "Warehouse Live", "Bayou Music Center", "Bronze Peacock at House of Blues"],
    concertHall: ["Bayou Music Center", "White Oak Music Hall (Outdoors)", "713 Music Hall", "Cynthia Woods Mitchell Pavilion"],
    arena: ["Toyota Center", "Cynthia Woods Mitchell Pavilion", "Shell Energy Stadium", "NRG Stadium"],
  },
  "Austin": {
    bar: ["The Hole in the Wall", "Emo's Austin", "Beerland", "The Parish Underground"],
    theatre: ["Stubb's Indoor", "Antone's", "Parish", "Paramount Theatre"],
    concertHall: ["ACL Live at the Moody Center", "Emo's Austin", "Long Center for the Performing Arts", "Stubb's Outdoor Amphitheatre"],
    arena: ["Moody Center", "Austin360 Amphitheatre", "H-E-B Center at Cedar Park", "Q2 Stadium"],
  },
  "San Antonio": {
    bar: ["Paper Tiger", "The Lonesome Rose", "Limelight", "The Mix"],
    theatre: ["Aztec Theatre", "Charline McCombs Empire Theatre", "Tobin Center", "Sunken Garden Theatre"],
    concertHall: ["Majestic Theatre", "Tobin Center for the Performing Arts", "Sunken Garden Amphitheater", "Boeing Center at Tech Port"],
    arena: ["Frost Bank Center", "Boeing Center at Tech Port", "Alamodome", "UTSA Convocation Center"],
  },
  "Phoenix": {
    bar: ["Crescent Ballroom", "The Rebel Lounge", "Valley Bar", "Rhythm Room"],
    theatre: ["The Van Buren", "Comerica Theatre", "Celebrity Theatre", "Marquee Theatre"],
    concertHall: ["The Marquee Theatre", "Arizona Financial Theatre", "Talking Stick Resort Amphitheatre", "Mesa Arts Center"],
    arena: ["Footprint Center", "Talking Stick Resort Amphitheatre", "Desert Diamond Arena", "State Farm Stadium"],
  },
  "Albuquerque": {
    bar: ["Launchpad", "Burt's Tiki Lounge", "Sister Bar", "Low Spirits"],
    theatre: ["Sunshine Theater", "Kimo Theatre", "El Rey Theatre", "Isleta Amphitheater"],
    concertHall: ["Kiva Auditorium", "Journal Pavilion", "Popejoy Hall", "Tingley Coliseum"],
    arena: ["Isleta Amphitheater", "Tingley Coliseum", "Sandia Resort Amphitheater", "UNM Pit"],
  },
  "Tucson": {
    bar: ["191 Toole", "Club Congress", "Solar Culture", "The Rialto"],
    theatre: ["Rialto Theatre", "Hotel Congress Stage", "Rialto Theatre", "Berger Performing Arts Center"],
    concertHall: ["Tucson Music Hall", "Anselmo Valencia Tori Amphitheater", "Fox Tucson Theatre", "Rialto Theatre"],
    arena: ["Tucson Arena", "Anselmo Valencia Tori Amphitheater", "Arizona Stadium", "McKale Center"],
  },
  "Las Vegas": {
    bar: ["Bunkhouse Saloon", "Beauty Bar", "Insert Coins", "Art Bar at Art Motel"],
    theatre: ["Brooklyn Bowl", "House of Blues", "The Joint at Hard Rock", "Vinyl at Hard Rock Hotel"],
    concertHall: ["The Pearl at Palms", "Michelob Ultra Arena", "Aladdin Theatre for the Performing Arts", "Smith Center for the Performing Arts"],
    arena: ["T-Mobile Arena", "Allegiant Stadium", "MGM Grand Garden Arena", "Michelob Ultra Arena"],
  },
  "El Paso": {
    bar: ["Lowbrow Palace", "The Tap Bar", "Bar None", "Monarch"],
    theatre: ["Tricky Falls", "Lowbrow Palace", "Plaza Theatre", "The Spot"],
    concertHall: ["Abraham Chavez Theatre", "Don Haskins Center", "El Paso Convention Center", "Sunland Park Racetrack & Casino"],
    arena: ["Don Haskins Center", "UTEP Sun Bowl", "El Paso County Coliseum", "Southwest University Park"],
  },
  "Oklahoma City": {
    bar: ["The Blue Door", "Opolis", "The Vanguard", "Loony Bin Comedy Club"],
    theatre: ["Tower Theatre", "Criterion", "Opolis", "Rodeo Opry"],
    concertHall: ["Rose State Performing Arts", "The Criterion", "Civic Center Music Hall", "Chesapeake Energy Arena"],
    arena: ["Paycom Center", "Chesapeake Energy Arena", "Chickasaw Bricktown Ballpark", "Frontier City"],
  },
  "Denver": {
    bar: ["Larimer Lounge", "Lion's Lair", "Hi-Dive", "Skylark Lounge"],
    theatre: ["Gothic Theatre", "Ogden Theatre", "Summit Music Hall", "Oriental Theater"],
    concertHall: ["Mission Ballroom", "Fillmore Auditorium", "Red Rocks Amphitheatre", "Boettcher Concert Hall"],
    arena: ["Ball Arena", "Red Rocks Amphitheatre", "Fiddler's Green Amphitheatre", "Empower Field at Mile High"],
  },
  "Colorado Springs": {
    bar: ["The Black Sheep", "Triple Nickel Tavern", "Vultures Bar", "The Iron Bird"],
    theatre: ["Ent Center for the Arts", "The Black Sheep", "Colorado Springs Fine Arts Center", "Stargazers Theatre"],
    concertHall: ["Pikes Peak Center", "ENT Center for the Arts", "The Antlers Hilton", "Colorado Springs Event Center"],
    arena: ["Broadmoor World Arena", "Pikes Peak Center", "UCCS Gallogly Events Center", "Falcon Stadium"],
  },
  "Salt Lake City": {
    bar: ["Kilby Court", "Diabolical Records", "Soundwell", "Urban Lounge"],
    theatre: ["Metro Music Hall", "The Complex", "State Room", "Pioneer Theatre"],
    concertHall: ["The Complex", "Eccles Theater", "Red Butte Garden Amphitheatre", "Sandy Amphitheater"],
    arena: ["Delta Center", "USANA Amphitheatre", "Rice-Eccles Stadium", "Vivint Arena"],
  },

  // US - West Coast
  "Los Angeles": {
    bar: ["The Echo", "Zebulon", "The Satellite", "Break Room 86"],
    theatre: ["El Rey Theatre", "The Fonda Theatre", "Teragram Ballroom", "Regent Theater"],
    concertHall: ["The Wiltern", "Hollywood Palladium", "Greek Theatre", "The Novo"],
    arena: ["Crypto.com Arena", "Hollywood Bowl", "Kia Forum", "SoFi Stadium"],
  },
  "San Francisco": {
    bar: ["The Hemlock Tavern", "Bottom of the Hill", "The Independent", "Neck of the Woods"],
    theatre: ["The Fillmore", "Great American Music Hall", "The Warfield", "Bimbo's 365 Club"],
    concertHall: ["The Warfield", "Bill Graham Civic Auditorium", "Masonic Auditorium", "Hardly Strictly Bluegrass"],
    arena: ["Chase Center", "Shoreline Amphitheatre", "Oracle Arena", "Cow Palace"],
  },
  "Seattle": {
    bar: ["The Crocodile", "Barboza", "High Dive", "Tractor Tavern"],
    theatre: ["The Showbox", "Neumos", "Neptune Theatre", "Paramount Theatre"],
    concertHall: ["The Moore Theatre", "WaMu Theater", "Paramount Theatre", "Chateau Ste. Michelle Winery"],
    arena: ["Climate Pledge Arena", "White River Amphitheatre", "WAMU Theater", "T-Mobile Park"],
  },
  "Portland": {
    bar: ["Doug Fir Lounge", "Mississippi Studios", "Bunk Bar", "Holocene"],
    theatre: ["Wonder Ballroom", "Revolution Hall", "Crystal Ballroom", "Aladdin Theater"],
    concertHall: ["Arlene Schnitzer Concert Hall", "Veterans Memorial Coliseum", "Edgefield Amphitheater", "Providence Park"],
    arena: ["Moda Center", "Providence Park", "Edgefield Amphitheater", "Veterans Memorial Coliseum"],
  },
  "San Diego": {
    bar: ["The Casbah", "Soda Bar", "The Hideout", "Music Box"],
    theatre: ["Observatory North Park", "House of Blues", "Balboa Theatre", "Spreckels Theatre"],
    concertHall: ["Humphreys Concerts by the Bay", "Cal Coast Credit Union Open Air Theatre", "Viejas Arena", "Petco Park"],
    arena: ["Pechanga Arena", "Petco Park", "Snapdragon Stadium", "Cal Coast Credit Union Open Air Theatre"],
  },
  "Sacramento": {
    bar: ["Harlow's", "Colony Club", "The Boardwalk", "Capitol Garage"],
    theatre: ["Ace of Spades", "Crest Theatre", "Harlows", "Sofia"],
    concertHall: ["Memorial Auditorium", "Sacramento Community Center Theater", "Thunder Valley Casino Resort", "Aftershock Festival"],
    arena: ["Golden 1 Center", "Cal Expo Amphitheatre", "Aftershock Festival Grounds", "Sutter Health Park"],
  },
  "San Jose": {
    bar: ["The Ritz", "Anno Domini Gallery", "Blank Club", "The Usual"],
    theatre: ["San Jose Civic", "City National Civic", "South First Billiards", "The Stage"],
    concertHall: ["City National Civic", "California Theatre", "San Jose Center for the Performing Arts", "Flint Center"],
    arena: ["SAP Center", "Levi's Stadium", "Shoreline Amphitheatre", "PayPal Park"],
  },
  "Oakland": {
    bar: ["The New Parish", "Starline Social Club", "The Uptown", "Eli's Mile High Club"],
    theatre: ["Fox Theater", "Paramount Theatre", "New Parish", "Yoshi's Oakland"],
    concertHall: ["Greek Theatre", "Henry J. Kaiser Convention Center", "Paramount Theatre", "Chabot Space and Science Center"],
    arena: ["Oakland Arena", "Oracle Arena", "RingCentral Coliseum", "Oakland-Alameda County Coliseum"],
  },
  "Anaheim": {
    bar: ["Chain Reaction", "The Ranch Saloon", "House of Blues Anaheim", "Fox and Hounds British Pub"],
    theatre: ["The Parish", "House of Blues Anaheim", "Anaheim Convention Center", "Streamline Hotel"],
    concertHall: ["City National Grove of Anaheim", "House of Blues Anaheim", "Angel Stadium", "Honda Center"],
    arena: ["Honda Center", "Angel Stadium", "City National Grove of Anaheim", "Disneyland Resort"],
  },
  "Fresno": {
    bar: ["The Fulton 55", "Strummer's", "Tioga Sequoia Brewing", "Peeve's Public House"],
    theatre: ["Strummer's", "Warnors Theatre", "Saroyan Theatre", "Rogue Festival"],
    concertHall: ["Saroyan Theatre", "Fresno Convention Center", "Chukchansi Park", "Selland Arena"],
    arena: ["Save Mart Center", "Chukchansi Park", "Fresno Convention Center", "Selland Arena"],
  },
  "Long Beach": {
    bar: ["Alex's Bar", "Federal Bar", "Portfolio Coffeehouse", "Prospekt Brewing"],
    theatre: ["The Vault 350", "The Pike Outlets", "Beverly O'Neill Theater", "Long Beach Terrace Theater"],
    concertHall: ["The Queen Mary Events", "Carpenter Performing Arts Center", "The Pike Outlets", "Long Beach Convention Center"],
    arena: ["Long Beach Arena", "Dodger Stadium", "Long Beach Civic Center", "Walter Pyramid"],
  },
  "Bakersfield": {
    bar: ["The Mint", "Pyrenees Cafe", "Mexicali Bar & Grill", "Buck Owens' Crystal Palace"],
    theatre: ["Fox Theater Bakersfield", "Buck Owens' Crystal Palace", "Rabobank Theatre", "Empty Bottle"],
    concertHall: ["Mechanics Bank Theater", "Dignity Health Smart Financial Centre", "Rabobank Arena", "Harvey Auditorium"],
    arena: ["Mechanics Bank Arena", "Mechanics Bank Theater", "Dignity Health Smart Financial Centre", "Bakersfield Memorial Hospital Arena"],
  },

  // US - Other
  "Honolulu": {
    bar: ["Anna O'Brien's", "The Dragon Upstairs", "Bar 35", "Downbeat Diner & Lounge"],
    theatre: ["Hawaiian Brian's", "The Republik", "Doris Duke Theatre", "Kaimuki Theatre"],
    concertHall: ["Blaisdell Concert Hall", "Blaisdell Arena", "Neal Blaisdell Center", "Waikiki Shell"],
    arena: ["Hawaiian Airlines Arena", "Aloha Stadium", "Waikiki Shell", "Stan Sheriff Center"],
  },
  "Anchorage": {
    bar: ["Williwaw Social", "Darwin's Theory", "The Tap Root", "Blues Central at the Chef's Inn"],
    theatre: ["Bear Tooth Theatrepub", "Taproot Theater", "Sydney Laurence Theatre", "Alaska Experience Theatre"],
    concertHall: ["Alaska Center for the Performing Arts", "Egan Civic & Convention Center", "Dena'ina Civic & Convention Center", "Sullivan Arena"],
    arena: ["Alaska Airlines Center", "Sullivan Arena", "Egan Civic & Convention Center", "Ben Boeke Ice Arena"],
  },

  // Canada
  "Toronto": {
    bar: ["The Garrison", "Lee's Palace", "Velvet Underground", "Distrikt"],
    theatre: ["The Danforth Music Hall", "Phoenix Concert Theatre", "Massey Hall", "History"],
    concertHall: ["Meridian Hall", "Massey Hall", "Rebel", "Scotiabank Arena"],
    arena: ["Scotiabank Arena", "Rogers Centre", "Budweiser Stage", "FirstOntario Concert Hall"],
  },
  "Montreal": {
    bar: ["Bar Le Ritz PDB", "Newspeak", "Datcha", "Stereo Nightclub"],
    theatre: ["Theatre Beanfield", "Club Soda", "Rialto Theatre", "La Tulipe"],
    concertHall: ["MTELUS", "Corona Theatre", "L'Olympia", "Théâtre St-Denis"],
    arena: ["Bell Centre", "Centre Bell", "Videotron Centre", "Parc Jean-Drapeau"],
  },
  "Vancouver": {
    bar: ["The Biltmore Cabaret", "Venue Nightclub", "Fortune Sound Club", "Media Club"],
    theatre: ["The Commodore Ballroom", "Vogue Theatre", "Rickshaw Theatre", "Hollywood Theatre"],
    concertHall: ["Queen Elizabeth Theatre", "Pacific Coliseum", "PNE Amphitheatre", "Malkin Bowl"],
    arena: ["Rogers Arena", "BC Place", "Pacific Coliseum", "Abbotsford Centre"],
  },
  "Calgary": {
    bar: ["The Palomino Smokehouse", "Broken City", "Dickens Pub", "Commonwealth Bar & Stage"],
    theatre: ["MacEwan Hall Ballroom", "Palace Theatre", "Gateway to Banff National Park", "The Marquee"],
    concertHall: ["Jack Singer Concert Hall", "Grey Eagle Resort & Casino", "ENMAX Amphitheatre", "Southern Alberta Jubilee Auditorium"],
    arena: ["Scotiabank Saddledome", "McMahon Stadium", "ENMAX Amphitheatre", "Stampede Grandstand"],
  },
  "Edmonton": {
    bar: ["The Starlite Room", "Wunderbar Hofbrauhaus", "Yellowhead Brewery", "Brixx Bar and Stage"],
    theatre: ["Union Hall", "Needle Vinyl Tavern", "McDougall United Church", "The Needle"],
    concertHall: ["Winspear Centre", "Northern Alberta Jubilee Auditorium", "Century Casino", "Edmonton Convention Centre"],
    arena: ["Rogers Place", "Commonwealth Stadium", "Edmonton Expo Centre", "Northern Alberta Jubilee Auditorium"],
  },
  "Ottawa": {
    bar: ["Cafe Dekcuf", "House of Targ", "Pressed", "Irene's Pub"],
    theatre: ["The Bronson Centre", "Babylon Nightclub", "Avant-Garde Bar", "The NAC Theatre"],
    concertHall: ["National Arts Centre", "Canadian Tire Centre", "TD Place Arena", "Ottawa Convention Centre"],
    arena: ["Canadian Tire Centre", "TD Place", "Ottawa Stadium", "Richcraft Recreational Complex"],
  },
  "Winnipeg": {
    bar: ["The Handsome Daughter", "The Good Will Social Club", "Times Change(d) High & Lonesome Club", "Forth"],
    theatre: ["Burton Cummings Theatre", "West End Cultural Centre", "Park Theatre", "Lo Pub"],
    concertHall: ["Centennial Concert Hall", "MTS Centre", "Rainbow Stage", "Club Regent Casino"],
    arena: ["Canada Life Centre", "IG Field", "Bell MTS Iceplex", "Assiniboia Downs"],
  },
  "Quebec City": {
    bar: ["Bar Le Drague", "L'Anti Bar & Spectacles", "Bar Chez Maurice", "Le Cercle"],
    theatre: ["Salle Albert-Rousseau", "Impérial de Québec", "Théâtre Capitole", "Palais Montcalm"],
    concertHall: ["Grand Théâtre de Québec", "Palais Montcalm", "Festival d'été de Québec", "Centre Vidéotron"],
    arena: ["Videotron Centre", "Centre Vidéotron", "PEPS Arena", "Festival d'été de Québec"],
  },
  "Hamilton": {
    bar: ["This Ain't Hollywood", "The Casbah", "Doors Pub", "The Ship"],
    theatre: ["FirstOntario Concert Hall", "The Casbah", "The Studio at Hamilton Place", "Zoetic Theatre"],
    concertHall: ["Hamilton Place", "FirstOntario Concert Hall", "Copps Coliseum", "Molson Canadian Amphitheatre"],
    arena: ["FirstOntario Centre", "Tim Hortons Field", "Hamilton Convention Centre", "Copps Coliseum"],
  },
  "Halifax": {
    bar: ["The Seahorse Tavern", "Gus' Pub", "The Carleton Music Bar & Grill", "The Dome"],
    theatre: ["The Marquee Club", "Spatz Theatre", "Venue 346", "Rebecca Cohn Auditorium"],
    concertHall: ["Spatz Theatre", "Rebecca Cohn Auditorium", "Halifax Forum", "Scotiabank Centre"],
    arena: ["Scotiabank Centre", "Halifax Forum", "Hector Arena", "Centre for the Arts"],
  },
  "Victoria": {
    bar: ["Lucky Bar", "The Mint", "The Bard & Banker", "Hermann's Jazz Club"],
    theatre: ["The Limit", "Capital Ballroom", "McPherson Playhouse", "Royal Theatre"],
    concertHall: ["McPherson Playhouse", "Royal Theatre", "Alix Goolden Performance Hall", "University of Victoria"],
    arena: ["Save-On-Foods Memorial Centre", "Centennial Stadium", "Q Centre", "Bear Mountain Arena"],
  },
  "Saskatoon": {
    bar: ["Amigos Cantina", "Lydian", "O'Brians Event Centre", "The Bassment"],
    theatre: ["Broadway Theatre", "TCU Place", "Persephone Theatre", "Shumiatcher Theatre"],
    concertHall: ["TCU Place", "Sasktel Centre", "Capitol Theatre", "Centennial Auditorium"],
    arena: ["SaskTel Centre", "Mosaic Stadium", "Rutherford Rink", "Merlis Belsher Place"],
  },
  "Regina": {
    bar: ["The Exchange", "Bushwakker Brewpub", "Nicky's Cafe and Bar", "Ozark Social Club"],
    theatre: ["The Artesian", "Globe Theatre", "Conexus Arts Centre", "Bumpers"],
    concertHall: ["Conexus Arts Centre", "Brandt Centre", "Wascana Centre", "Regina Performing Arts Centre"],
    arena: ["Brandt Centre", "Mosaic Stadium", "Conexus Arts Centre", "Evraz Place"],
  },
  "Kelowna": {
    bar: ["Habitat", "Flashback Club", "Doc Willoughby's", "The Garage Bar"],
    theatre: ["Rotary Centre for the Arts", "Kelowna Community Theatre", "The Grand Okanagan Resort", "Sunshine Theatre"],
    concertHall: ["Kelowna Community Theatre", "Prospera Place", "Okanagan Heritage Museum", "Mary Irwin Theatre"],
    arena: ["Prospera Place", "Apple Bowl", "UBC Okanagan", "Kelowna Memorial Arena"],
  },
  "Windsor": {
    bar: ["Phog Lounge", "Cheeseburger Paradise", "The Koi Bar", "Coach and Horses Pub"],
    theatre: ["The Colosseum at Caesars Windsor", "The Rockstar Music Hall", "Capitol Theatre Windsor", "The Chrysler Theatre"],
    concertHall: ["Capitol Theatre Windsor", "The Chrysler Theatre", "University of Windsor Alumni Hall", "Caesars Windsor"],
    arena: ["WFCU Centre", "Caesars Windsor Event Centre", "University of Windsor Alumni Hall", "St. Denis Centre"],
  },
  "London, ON": {
    bar: ["Call The Office", "Rum Runners", "London Music Hall", "The Rum Runners Bar"],
    theatre: ["London Music Hall", "Aeolian Hall", "Centennial Hall", "Budweiser Gardens"],
    concertHall: ["London Convention Centre", "Centennial Hall", "Covent Garden Market", "Budweiser Gardens"],
    arena: ["Canada Life Place", "Budweiser Gardens", "TD Waterhouse Centre", "Western Fair Raceway"],
  },
  "Kitchener": {
    bar: ["Rhythm & Brews", "Ren's Pets", "The Chainsaw", "Cafe 1842"],
    theatre: ["Kitchener Memorial Auditorium", "Centre In The Square", "The Registry Theatre", "Conrad Centre"],
    concertHall: ["Centre In The Square", "Kitchener Memorial Auditorium", "Bingemans Conference Centre", "Grand River Raceway"],
    arena: ["The Aud", "Centre In The Square", "Kitchener Memorial Auditorium", "Dreamline Arena"],
  },
  "Barrie": {
    bar: ["Loose Ends Bar", "Rally Point Sports Bar", "Fifth Element", "The Georgian Tap"],
    theatre: ["The Georgian Theatre", "Gryphon Theatre", "MacLaren Art Centre", "Barrie Molson Theatre"],
    concertHall: ["Barrie Molson Theatre", "Georgian Downs", "Sadlon Arena", "Barrie Curling Club"],
    arena: ["Sadlon Arena", "Georgian Downs", "Barrie Molson Theatre", "Lamoureux Park"],
  },
};

export function getVenuesForCity(city: string): CityVenues {
  return CITY_VENUES[city] ?? {
    bar: ["Local Bar"],
    theatre: ["Local Theatre"],
    concertHall: ["Concert Hall"],
    arena: ["Arena"],
  };
}
