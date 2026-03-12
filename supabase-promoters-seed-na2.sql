-- North American promoter seed data batch 2 — 23 cities, 86 venues
-- Run in Supabase SQL Editor after supabase-promoters-migration.sql

insert into public.promoters (venue_name, city, country, capacity, venue_type, booking_email, website, talent_buyer, promoter_company, notes) values

-- PHILADELPHIA
('The Fire', 'Philadelphia', 'US', 150, 'bar', 'firephilly@gmail.com', 'https://firephilly.com', null, 'Independent', '412 W Girard Ave, Northern Liberties. Live music 7 nights/week.'),
('Ortlieb''s', 'Philadelphia', 'US', 100, 'bar', 'bookortliebs@gmail.com', 'https://ortliebsphilly.com', null, 'Independent', 'Hot dog bar + venue, Northern Liberties, 847 N 3rd St.'),
('PhilaMOCA', 'Philadelphia', 'US', 150, 'theatre', 'gavin@philamoca.org', 'https://www.philamoca.org', 'Gavin', 'Independent', 'All-ages, former mausoleum showroom, 531 N 12th St.'),
('MilkBoy', 'Philadelphia', 'US', 300, 'club', 'booking@milkboyphilly.com', 'https://www.milkboymusic.com', 'Jeff', 'Independent', 'Two-level Center City venue, indie/hip-hop/alt rock, 1100 Chestnut St.'),
('Underground Arts', 'Philadelphia', 'US', 600, 'theatre', 'booking@undergroundarts.org', 'https://undergroundarts.org', null, 'Independent', 'Raw industrial space, 1200 Callowhill St.'),
('Kung Fu Necktie', 'Philadelphia', 'US', 200, 'bar', 'booking@kungfunecktie.com', 'https://kungfunecktie.com', 'Jeff', 'Independent', 'Fishtown dive bar and music venue, 1248 N Front St.'),
('Johnny Brenda''s', 'Philadelphia', 'US', 250, 'bar', 'booking@johnnybrendas.com', 'https://johnnybrendas.com', null, 'Independent', 'Fishtown institution, 1201 Frankford Ave. Also local@johnnybrendas.com.'),
('World Cafe Live', 'Philadelphia', 'US', 650, 'club', 'booking@worldcafelive.org', 'https://worldcafelive.org', null, 'Independent', 'Two rooms: Lounge (200) + Music Hall (650); 3025 Walnut St.'),

-- WASHINGTON DC
('Black Cat', 'Washington DC', 'US', 700, 'club', 'booking@blackcatdc.com', 'https://www.blackcatdc.com', null, 'Independent', 'Iconic DC indie venue, 14th St corridor, main stage 700 + Backstage, 1811 14th St NW.'),
('DC9 Nightclub', 'Washington DC', 'US', 250, 'club', 'booking@dc9.club', 'https://dc9.club', null, 'Independent', 'Est. 2004 in Shaw, indie/dance, 1940 9th St NW.'),
('Songbyrd Music House', 'Washington DC', 'US', 250, 'club', 'booking@songbyrddc.com', 'https://songbyrddc.com', null, 'Independent', 'Union Market District, record cafe + concert space, 540 Penn St NE.'),
('Union Stage', 'Washington DC', 'US', 450, 'club', 'jon@unionstage.com', 'https://www.unionstagepresents.com', 'Jon Weiss', 'Union Stage Presents', 'SW Waterfront, all-ages, world-class sound. Also books Howard Theatre + Capital Turnaround, 740 Water St SW.'),
('Comet Ping Pong', 'Washington DC', 'US', 200, 'bar', 'cometpingpong@gmail.com', 'https://www.cometpingpong.com', null, 'Independent', 'Chevy Chase pizza + music venue, 5037 Connecticut Ave NW.'),
('Bossa Bistro + Lounge', 'Washington DC', 'US', 150, 'bar', 'coltun@gmail.com', 'http://bossadc.com', null, 'Independent', 'Adams Morgan, Latin/jazz/indie focus, 2463 18th St NW.'),

-- HOUSTON
('White Oak Music Hall', 'Houston', 'US', 1500, 'club', 'submissions@whiteoakmusichall.com', 'https://whiteoakmusichall.com', null, 'Independent', 'Multiple stages: Lawn (1500), Downstairs (400), Upstairs (200); 2915 N Main St.'),
('Warehouse Live Studio', 'Houston', 'US', 450, 'club', 'jpriceriseup@gmail.com', 'https://www.warehouselive.com', 'Jason Price', 'Independent', 'Studio room (450) + Ballroom (1300) + Greenroom (150); 2600 Travis St.'),
('Rudyard''s British Pub', 'Houston', 'US', 200, 'bar', 'booking@rudyardspub.com', 'https://rudyardshtx.com', null, 'Independent', 'Montrose institution since 1978, upstairs live room, indie/punk/metal, 2010 Waugh Dr.'),
('The Continental Club Houston', 'Houston', 'US', 200, 'bar', 'info@continentalclub.com', 'https://continentalclub.com/houston', null, 'Independent', 'Blues/roots/country/rock focus, 3700 Main St.'),

-- PORTLAND
('Mississippi Studios', 'Portland', 'US', 300, 'club', 'booking@mississippistudios.com', 'https://mississippistudios.com', null, 'Independent', 'Former church, musician-owned, 3939 N Mississippi Ave.'),
('Dante''s', 'Portland', 'US', 300, 'club', 'booking@danteslive.com', 'https://www.danteslive.com', null, 'Independent', 'Old Town, nightly shows, eclectic genres, 350 W Burnside St.'),
('Holocene', 'Portland', 'US', 312, 'club', 'bookings@holocene.org', 'https://www.holocene.org', 'Scott McLean', 'Independent', 'Arts/music venue, indie/electronic, 19+. Also gina@holocene.org; 1001 SE Morrison St.'),
('Wonder Ballroom', 'Portland', 'US', 778, 'club', 'info@wonderballroom.com', 'https://wonderballroom.com', null, 'TrueWest', 'Promoted by TrueWest; 778 standing / 450 seated, 128 NE Russell St.'),
('Hawthorne Theatre', 'Portland', 'US', 550, 'theatre', 'gm@hawthornetheatre.com', 'https://hawthornetheatre.com', null, 'Independent', 'Main room 550 + lounge 100; 1507 SE 39th Ave.'),

-- SAN DIEGO
('The Casbah', 'San Diego', 'US', 200, 'bar', 'mrmazee@gmail.com', 'https://www.casbahmusic.com', 'Tim Mays', 'Casbah Presents', 'Iconic indie rock bar since 1989, 21+, 2501 Kettner Blvd.'),
('Soda Bar', 'San Diego', 'US', 230, 'bar', 'sodabarbooking@gmail.com', 'https://sodabarmusic.com', null, 'Soda Bar Presents', 'Normal Heights/City Heights border, indie/alt rock, 3615 El Cajon Blvd.'),
('Music Box San Diego', 'San Diego', 'US', 700, 'club', 'booking@musicboxsd.com', 'https://musicboxsd.com', null, 'Independent', 'Little Italy, indoor/outdoor spaces, 1337 India St.'),
('Belly Up Tavern', 'San Diego', 'US', 600, 'club', 'booking@bellyup.com', 'https://bellyup.com', 'Pete McDevitt', 'Belly Up Presents', 'Solana Beach, national/regional acts. Also Chad Waldorf regional buyer; 143 S Cedros Ave.'),

-- MINNEAPOLIS
('7th St Entry', 'Minneapolis', 'US', 250, 'club', 'info@first-avenue.com', 'https://first-avenue.com', null, 'First Avenue', 'Small room owned by First Avenue. Also owns Fine Line (650) and Turf Club (350).'),
('Cedar Cultural Center', 'Minneapolis', 'US', 465, 'theatre', 'booking@thecedar.org', 'https://www.thecedar.org', 'James Taylor', 'Independent', 'World/folk/indie nonprofit venue, 416 Cedar Ave S. Also jtaylor@thecedar.org.'),
('Fine Line', 'Minneapolis', 'US', 650, 'club', 'info@first-avenue.com', 'https://first-avenue.com/venue/fine-line', null, 'First Avenue', 'Owned by First Avenue; downtown Minneapolis, 318 1st Ave N.'),
('331 Club', 'Minneapolis', 'US', 120, 'bar', 'booking@331club.com', 'https://www.331club.com', null, 'Independent', 'Northeast Minneapolis neighborhood bar, jazz/roots/indie, 331 13th Ave NE.'),

-- DETROIT
('El Club', 'Detroit', 'US', 450, 'club', 'info@elclubdetroit.com', 'https://elclubdetroit.com', null, 'Independent', 'Southwest Detroit all-ages venue, indie/alternative, 4114 W Vernor Hwy.'),
('Magic Stick', 'Detroit', 'US', 400, 'club', 'booking@majesticdetroit.com', 'https://www.majesticdetroit.com', null, 'Majestic Entertainment Center', 'Upstairs room (400 cap); also manages Garden Bowl and Majestic Cafe; 4140 Woodward Ave.'),
('Marble Bar', 'Detroit', 'US', 350, 'bar', 'booking@themarblebar.com', 'https://themarblebar.com', null, 'Independent', 'Indoor ballroom + covered patio, 21+, indie/electronic/punk, 1501 Holden St.'),
('Saint Andrew''s Hall', 'Detroit', 'US', 900, 'theatre', 'JamesBourgault@livenation.com', 'https://www.saintandrewsdetroit.com', 'James Bourgault', 'Live Nation', 'Historic hall + basement Shelter (400 cap) for smaller acts; 431 E Congress St.'),

-- NEW ORLEANS
('Tipitina''s', 'New Orleans', 'US', 800, 'club', 'nick@tipitinas.com', 'https://tipitinas.com', 'Nicolaus Logan', 'Independent', 'NOLA institution since 1977, Uptown. Also info@tipitinas.com; 501 Napoleon Ave.'),
('One Eyed Jacks', 'New Orleans', 'US', 500, 'club', 'booking@oneeyedjacks.net', 'https://www.oneeyedjacks.net', 'Ron Richard', 'SimplePlay Presents', 'French Quarter, premier alt/indie touring room, 1104 Decatur St.'),
('Maple Leaf Bar', 'New Orleans', 'US', 415, 'bar', 'booking@mapleleafbar.com', 'https://www.mapleleafbar.com', null, 'Independent', 'Since 1974, Oak Street/Carrollton, live music 7 nights; 8316 Oak St.'),
('The Howlin Wolf', 'New Orleans', 'US', 1300, 'club', 'booking@thehowlinwolf.com', 'https://www.thehowlinwolf.com', null, 'Independent', 'Main room (1300) + The Den (100); 907 S Peters St.'),

-- PHOENIX
('Crescent Ballroom', 'Phoenix', 'US', 500, 'club', 'submissions@crescentphx.com', 'https://www.crescentphx.com', 'Jesse Teer', 'Independent', 'Downtown PHX, ballroom (500) + lounge (300), all-ages friendly, 308 N 2nd Ave.'),
('Valley Bar', 'Phoenix', 'US', 250, 'bar', 'events@valleybarphx.com', 'https://www.valleybarphx.com', null, 'Independent', 'Underground basement venue, downtown PHX, 130 N Central Ave.'),
('The Rebel Lounge', 'Phoenix', 'US', 300, 'club', 'info@therebellounge.com', 'https://therebellounge.com', null, 'Psyko Steve Presents', 'National acts via Psyko Steve Presents; 2303 E Indian School Rd.'),

-- MONTREAL
('Bar Le Ritz PDB', 'Montreal', 'CA', 248, 'club', 'info@barleritzpdb.com', 'https://www.barleritzpdb.com', null, 'Blue Skies Turn Black', 'Mile-Ex, indie-focused, run by Blue Skies Turn Black promoters; 179 Jean-Talon O.'),
('Fairmount Theatre', 'Montreal', 'CA', 450, 'theatre', 'info@theatrefairmount.com', 'https://www.theatrefairmount.com', null, 'Independent', 'Mile End, renovated 450-cap, 5240 Ave du Parc.'),
('Casa del Popolo', 'Montreal', 'CA', 100, 'bar', 'booking@casadelpopolo.com', 'https://casadelpopolo.com', null, 'Independent', 'Plateau-Mont-Royal, small intimate room. Sister venue La Sala Rossa (250) next door; 4873 Blvd St-Laurent.'),
('La Sala Rossa', 'Montreal', 'CA', 250, 'club', 'booking@casadelpopolo.com', 'https://casadelpopolo.com/en/info/la-sala-rossa', null, 'Independent', 'Sister venue to Casa del Popolo, Plateau; shared booking; 4848 Blvd St-Laurent.'),
('Club Soda', 'Montreal', 'CA', 950, 'club', 'info@clubsoda.ca', 'https://clubsoda.ca', null, 'Independent', 'Downtown MTL, 950 standing / 450 seated; 1225 Blvd St-Laurent.'),

-- VANCOUVER
('Biltmore Cabaret', 'Vancouver', 'CA', 350, 'club', 'booking@biltmorecabaret.com', 'https://www.biltmorecabaret.com', null, 'Independent', '19+, 395 Kingsway Ave.'),
('Rickshaw Theatre', 'Vancouver', 'CA', 600, 'theatre', 'booking@rickshawtheatre.com', 'https://rickshawtheatre.com', null, 'Independent', 'DTES, scalable 200-600 cap, all-ages options, 254 E Hastings St.'),
('Fox Cabaret', 'Vancouver', 'CA', 275, 'club', 'booking@foxcabaret.com', 'https://www.foxcabaret.com', null, 'Independent', '19+, Mount Pleasant neighborhood, indie/electronic/arts, 2321 Main St.'),
('The Cobalt', 'Vancouver', 'CA', 200, 'bar', 'booking@thecobalt.ca', 'https://thecobalt.ca', null, 'Cobalt Management Group', 'Est. 1911, Main & Prior, punk/indie/drag, 917 Main St.'),

-- LAS VEGAS
('Swan Dive', 'Las Vegas', 'US', 450, 'club', 'swandivelv@gmail.com', 'https://swandivelv.com', 'Mike Henry', 'Independent', 'Arts District, premier indie room in Las Vegas, 1301 S Main St.'),
('Sand Dollar Lounge', 'Las Vegas', 'US', 175, 'bar', 'booking@thesanddollarlv.com', 'https://thesanddollarlv.com', null, 'Independent', '21+, bluesy vibe, roots/rock/soul; 3355 Spring Mountain Rd.'),
('The Usual Place', 'Las Vegas', 'US', 200, 'bar', 'info@theusualplace.vegas', 'https://www.theusualplace.vegas', 'Danielle O''Hara', 'Nevermore Productions', 'Downtown LV, indie rock focus; 100 S Maryland Pkwy.'),

-- CHARLOTTE
('Visulite Theatre', 'Charlotte', 'US', 500, 'theatre', 'boxoffice@visulite.com', 'https://visulite.com', null, 'Independent', 'Elizabeth neighborhood, 1615 Elizabeth Ave.'),
('The Evening Muse', 'Charlotte', 'US', 150, 'bar', 'info@eveningmuse.com', 'https://www.eveningmuse.com', null, 'Independent', 'NoDa neighborhood, original/acoustic-focused intimate venue, 3227 N Davidson St.'),
('Neighborhood Theatre', 'Charlotte', 'US', 800, 'theatre', 'help@neighborhoodtheatre.com', 'https://neighborhoodtheatre.com', null, 'Independent', 'NoDa, Charlotte''s premier indie venue since 1997, 511 E 36th St.'),
('Petra''s Bar', 'Charlotte', 'US', 120, 'bar', 'booking@petrasbar.com', 'https://petrasbar.com', null, 'Independent', 'Plaza Midwood, piano bar/cabaret/indie, 1919 Commonwealth Ave.'),

-- KANSAS CITY
('recordBar', 'Kansas City', 'US', 300, 'bar', 'booking@therecordbar.com', 'https://www.therecordbar.com', null, 'Independent', 'Crossroads Arts District, indie/alt focus, 1020 Westport Rd.'),
('The Rino', 'Kansas City', 'US', 150, 'bar', 'booking@therinokc.com', 'https://www.therinokc.com', null, 'Independent', 'River North KC, full-time music venue + event space, 314 Armour Rd.'),
('Knuckleheads Saloon', 'Kansas City', 'US', 500, 'bar', 'knuckleheadskc@gmail.com', 'https://knuckleheadskc.com', null, 'Independent', '5 stages incl. outdoor, roots/Americana/rock, 2715 Rochester Ave.'),

-- CLEVELAND
('Beachland Ballroom & Tavern', 'Cleveland', 'US', 500, 'club', 'marketing@beachlandballroom.com', 'https://www.beachlandballroom.com', 'Mark E. Leddy', 'Independent', 'Waterloo Arts District, Ballroom (500) + Tavern (150). Assistant buyer: Ryan Hodson; 15711 Waterloo Rd.'),
('Grog Shop', 'Cleveland', 'US', 400, 'club', 'booking@grogshop.gs', 'https://grogshop.gs', null, 'Independent', 'Cleveland Heights, 400 cap, indie/alt. Do not call for booking; 2785 Euclid Heights Blvd.'),
('Happy Dog', 'Cleveland', 'US', 175, 'bar', 'happydogbook@gmail.com', 'https://happydogcleveland.com', null, 'Independent', 'Gordon Square Arts District, hot dogs + live music, 5801 Detroit Ave.'),

-- SALT LAKE CITY
('Kilby Court', 'Salt Lake City', 'US', 250, 'club', 'sam@snspresents.com', 'https://www.kilbycourt.com', 'Sam Hurtado', 'S&S Presents', 'SLC''s longest-running all-ages venue. Touring: moriah@snspresents.com; 741 S Kilby Ct.'),
('Urban Lounge', 'Salt Lake City', 'US', 350, 'club', 'moriah@snspresents.com', 'https://www.theurbanloungeslc.com', 'Moriah Glazier', 'S&S Presents', 'Central City, indie/alt/electronic, since 2001; 241 S 500 E.'),
('Soundwell SLC', 'Salt Lake City', 'US', 600, 'club', 'info@soundwellslc.com', 'https://soundwellslc.com', null, 'LNE Presents', 'Downtown SLC, operated with LNE Presents; 149 W 200 S.'),

-- PITTSBURGH
('Mr. Smalls Funhouse', 'Pittsburgh', 'US', 200, 'club', 'booking@mrsmallspresents.com', 'https://mrsmalls.com', null, 'Mr. Smalls Presents', 'Funhouse room (200 cap); main Theatre is 800; 400 Lincoln Ave, Millvale.'),
('Thunderbird Cafe & Music Hall', 'Pittsburgh', 'US', 380, 'club', 'contact@thunderbirdmusichall.com', 'https://thunderbirdmusichall.com', null, 'Drusky Entertainment', 'Lawrenceville, 380 cap, booking via Drusky Entertainment; 4053 Butler St.'),
('Rex Theatre (Enclave)', 'Pittsburgh', 'US', 400, 'theatre', 'ben@rextheater.net', 'https://rextheater.net', 'Ben', 'Independent', 'South Side, 300 seated/400 standing; 1602 E Carson St.'),

-- INDIANAPOLIS
('Hi-Fi', 'Indianapolis', 'US', 400, 'club', 'booking@hifiindy.com', 'https://hifiindy.com', null, 'Independent', 'Fountain Square, 400 cap, 21+; also Hi-Fi Annex + Lo-Fi Lounge; 1043 Virginia Ave.'),
('The Vogue', 'Indianapolis', 'US', 600, 'theatre', 'info@thevogue.com', 'https://www.thevogue.com', null, 'Independent', 'Broad Ripple, 600 cap, 21+, national/regional touring; 6259 N College Ave.'),
('The Mousetrap', 'Indianapolis', 'US', 200, 'bar', 'booking@trapindy.com', 'https://trapindy.com', null, 'Independent', 'Nationally known small venue, jam/bluegrass/jazz/electronic; 5565 N Keystone Ave.'),

-- COLUMBUS
('Ace of Cups', 'Columbus', 'US', 300, 'bar', 'info@aceofcupsbar.com', 'https://aceofcupsbar.com', null, 'Independent', 'Short North/campus area, craft beer + live music, 2619 N High St.'),
('Rumba Cafe', 'Columbus', 'US', 200, 'bar', 'timothy@celebrityetc.com', 'https://www.columbusrumbacafe.com', 'Timothy', 'Celebrity Etc.', 'Old North Columbus near OSU, live music 7 nights; 2507 Summit St.'),
('The Spacebar', 'Columbus', 'US', 200, 'bar', 'bookingspacebar@gmail.com', 'https://www.thespacebarcolumbus.com', null, 'Independent', 'Short North/campus, indie/punk/electronic, since 2014; 2590 N High St.'),

-- MILWAUKEE
('Cactus Club', 'Milwaukee', 'US', 150, 'club', 'shows@cactusclubmilwaukee.com', 'https://www.cactusclubmilwaukee.com', 'Kelsey', 'Independent', 'Queer-owned, artist-run, Bay View; also kelsey@cactusclubmilwaukee.com; 2496 S Wentworth Ave.'),
('Shank Hall', 'Milwaukee', 'US', 300, 'club', 'shank@wi.rr.com', 'https://shankhall.com', 'Peter Jest', 'Independent', 'Milwaukee''s showcase venue since 1989, 21+, all genres; 1434 N Farwell Ave.'),
('Turner Hall Ballroom', 'Milwaukee', 'US', 1000, 'theatre', 'booking@millerpubs.com', 'https://millerpubs.com/turner-hall-ballroom', null, 'FPC Live / Frank Productions', 'Historic 1882 building, Frank Productions books; 1040 N 4th St.'),

-- CALGARY
('The Palomino Smokehouse', 'Calgary', 'CA', 200, 'bar', 'booking@thepalomino.ca', 'https://thepalomino.ca', null, 'Concorde Group', 'Downtown Calgary BBQ + music since 2004; 109 7th Ave SW.'),
('Dickens Pub', 'Calgary', 'CA', 300, 'bar', 'booking@dickensyyc.com', 'https://dickensyyc.com', null, 'Independent', 'Downtown Calgary, punk/metal/indie/folk focus; 1000 9th Ave SW.'),
('Broken City', 'Calgary', 'CA', 201, 'bar', 'info@brokencity.ca', 'http://www.brokencity.ca', null, 'Independent', 'Beltline district, indie/rock/electronic, 19+; 613 11th Ave SW.'),

-- EDMONTON
('The Starlite Room', 'Edmonton', 'CA', 600, 'club', 'art@starliteroom.ca', 'https://www.starliteroom.ca', 'Art Szabo', 'Independent', 'Downtown Edmonton, 600 upstairs + BRIXX Bar (200) downstairs; 10030 102 St NW.'),
('River City Revival House', 'Edmonton', 'CA', 200, 'bar', 'info@revival-edmonton.com', 'https://www.revival-edmonton.com', null, 'Independent', 'Below Starlite Room; 10030 102 St NW.'),
('Mercury Room', 'Edmonton', 'CA', 350, 'club', 'booking@mercuryroomyeg.com', 'https://www.mercuryroomyeg.com', null, 'Independent', 'North Edge of downtown Edmonton adjacent to Rogers Place arena.'),

-- OTTAWA
('Babylon Nightclub', 'Ottawa', 'CA', 350, 'club', 'adam@babylonclub.ca', 'https://www.babylonclub.ca', 'Adam', 'Independent', '317 Bank St, 19+, hip-hop/punk/indie rock/electronic.'),
('Cafe Dekcuf', 'Ottawa', 'CA', 120, 'bar', 'info@cafedekcuf.ca', 'https://www.cafedekcuf.ca', null, 'Independent', 'Byward Market, 221 Rideau St, 19+, indie/electronic.'),
('Irene''s Pub', 'Ottawa', 'CA', 150, 'bar', 'info@irenespub.ca', 'https://irenespub.ca', null, 'Independent', 'Old Ottawa South institution, roots/folk/indie/jazz, 885 Bank St.'),
('Dominion Tavern', 'Ottawa', 'CA', 200, 'bar', 'info@tavern.ca', 'https://www.tavern.ca', null, 'Independent', 'ByWard Market, punk/garage/rock focus, 33 York St.');
