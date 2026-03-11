-- Promoter/venue seed data — generated from web research March 2026
-- Run in Supabase SQL Editor after supabase-promoters-migration.sql

insert into public.promoters (venue_name, city, country, capacity, venue_type, booking_email, website, talent_buyer, promoter_company, notes) values

-- NEW YORK
('Mercury Lounge', 'New York', 'US', 250, 'club', 'bookings@mercuryeastpresents.com', 'https://mercuryeastpresents.com/mercurylounge/', 'Ariel Bitran', 'Mercury East Presents', 'Iconic LES indie/rock club since 1993.'),
('Bowery Ballroom', 'New York', 'US', 575, 'club', 'bookings@mercuryeastpresents.com', 'https://mercuryeastpresents.com/boweryballroom/', 'Ariel Bitran', 'Mercury East Presents', 'Premier Lower East Side indie venue.'),
('Baby''s All Right', 'New York', 'US', 280, 'bar', 'booking@babysallright.com', 'https://babysallright.com', null, 'Independent', 'Williamsburg Brooklyn bar and music venue.'),
('Trans-Pecos', 'New York', 'US', 200, 'club', 'booking@thetranspecos.com', 'https://www.thetranspecos.com', null, 'Independent', 'DIY/experimental space in Ridgewood, Queens. All-ages.'),
('Rockwood Music Hall', 'New York', 'US', 300, 'bar', 'booking@rockwoodmusichall.com', 'https://www.rockwoodmusichall.com', null, 'Independent', 'Three stages on the Lower East Side. Heavy on singer-songwriters.'),
('Arlene''s Grocery', 'New York', 'US', 175, 'bar', 'booking@arlenesgrocery.net', 'https://www.arlenesgrocery.net', null, 'Independent', 'LES indie rock stalwart since 1995.'),
('Joe''s Pub', 'New York', 'US', 184, 'theatre', 'joespub@publictheater.org', 'https://www.joespub.com', null, 'The Public Theater', 'Cabaret-style seated venue inside The Public Theater.'),
('Brooklyn Steel', 'New York', 'US', 1800, 'club', 'bookings@mercuryeastpresents.com', 'https://brooklynsteel.com', 'Ariel Bitran', 'Mercury East Presents', 'Large standing venue in Williamsburg.'),
('Music Hall of Williamsburg', 'New York', 'US', 650, 'club', 'info@bowerypresents.com', 'https://www.musichallofwilliamsburg.com', null, 'Bowery Presents / AEG', 'Tri-level indie/rock venue in Williamsburg.'),
('Heaven Can Wait', 'New York', 'US', 150, 'bar', 'booking@heavencanwaitnyc.com', 'https://heavencanwaitnyc.com', null, 'Independent', 'Small East Village bar with regular live programming.'),
('The Bitter End', 'New York', 'US', 175, 'bar', 'info@thebitterend.com', 'https://www.thebitterend.com', null, 'Independent', 'NYC''s oldest rock club, opened 1961.'),

-- LOS ANGELES
('The Troubadour', 'Los Angeles', 'US', 500, 'club', 'booking@troubadour.com', 'https://troubadour.com', 'Jordan Anderson', 'Independent', 'Legendary West Hollywood venue since 1957.'),
('The Echo', 'Los Angeles', 'US', 350, 'club', 'booking@theecho.com', 'https://www.theecho.com', null, 'Spaceland Presents', 'Echo Park indie rock club.'),
('Echoplex', 'Los Angeles', 'US', 780, 'club', 'booking@theecho.com', 'https://www.theecho.com', null, 'Spaceland Presents', 'Larger downstairs room adjacent to The Echo.'),
('Moroccan Lounge', 'Los Angeles', 'US', 250, 'club', 'info@themoroccan.com', 'https://www.themoroccandtla.com', 'Julian Montano', 'Independent', 'DTLA intimate indie venue.'),
('The Roxy Theatre', 'Los Angeles', 'US', 500, 'club', 'info@goldenvoice.com', 'https://www.theroxy.com', null, 'Goldenvoice / AEG', 'Iconic Sunset Strip club since 1973.'),
('The Regent Theater', 'Los Angeles', 'US', 900, 'theatre', 'booking@theregenttheater.com', 'https://www.theregenttheater.com', null, 'Independent', 'DTLA former movie theatre converted to live music.'),
('El Rey Theatre', 'Los Angeles', 'US', 800, 'theatre', 'info@goldenvoice.com', 'https://www.theelrey.com', null, 'Goldenvoice / AEG', 'Art Deco theatre on Miracle Mile.'),
('Catch One', 'Los Angeles', 'US', 450, 'club', 'booking@catchonelosangeles.com', 'https://www.catchonelosangeles.com', null, 'Independent', 'Historic queer/soul club in Mid-City. Reopened 2019.'),

-- LONDON
('100 Club', 'London', 'UK', 320, 'club', 'ruby@the100club.co.uk', 'https://www.the100club.co.uk', 'Ruby Horton', 'Independent', 'Oxford Street. Legendary jazz/punk/rock venue since 1942.'),
('The Garage', 'London', 'UK', 600, 'club', 'boxoffice@thegarage.co.uk', 'https://www.thegarage.london', null, 'Independent', 'Highbury Corner. Long-running indie/rock/metal venue.'),
('The Lexington', 'London', 'UK', 200, 'bar', 'matty@thelexington.co.uk', 'https://www.thelexington.co.uk', 'Matty', 'Independent', 'King''s Cross / Islington bar with live music upstairs.'),
('229 The Venue', 'London', 'UK', 700, 'club', 'info@229.london', 'https://229.london', null, 'Independent', '229 Great Portland Street. Multi-room venue.'),
('MOTH Club', 'London', 'UK', 300, 'club', 'studio@lanzaroteworks.com', 'https://www.mothclub.co.uk', null, 'Lanzarote Works', 'Hackney working men''s club.'),
('Islington Assembly Hall', 'London', 'UK', 800, 'theatre', 'assemblyhall@islington.gov.uk', 'https://islingtonassemblyhall.co.uk', null, 'Independent', 'Upper Street. Council-run venue hired out to promoters.'),
('Scala', 'London', 'UK', 1100, 'theatre', 'info@scala.co.uk', 'https://scala.co.uk', null, 'Independent', 'King''s Cross former cinema. Three-room venue.'),
('Oslo Hackney', 'London', 'UK', 400, 'club', 'bookings@oslohackney.com', 'https://www.oslohackney.com', null, 'Independent', 'Above Hackney Central station.'),
('Shacklewell Arms', 'London', 'UK', 150, 'bar', 'studio@lanzaroteworks.com', 'https://www.shacklewellarms.com', null, 'Lanzarote Works', 'Dalston pub with back room live music.'),
('Cafe Oto', 'London', 'UK', 150, 'club', 'info@cafeoto.co.uk', 'https://www.cafeoto.co.uk', null, 'Independent', 'Dalston. Experimental/improvised/electronic music.'),

-- TORONTO
('Horseshoe Tavern', 'Toronto', 'CA', 350, 'bar', 'craig@horseshoetavern.com', 'https://horseshoetavern.com', 'Craig Laskey', 'Independent', 'Canadian institution since 1947.'),
('Lee''s Palace', 'Toronto', 'CA', 700, 'club', 'info@leespalace.com', 'https://www.leespalace.com', null, 'Independent', '529 Bloor St W. Rock/indie club with attached Dance Cave.'),
('Drake Underground', 'Toronto', 'CA', 250, 'club', 'programming@thedrakehotel.ca', 'https://thedrake.ca/thedrakehotel/drake-underground/', null, 'The Drake Hotel', 'Beneath The Drake Hotel. Indie/eclectic programming.'),
('The Rivoli', 'Toronto', 'CA', 240, 'bar', 'info@rivolitoronto.com', 'https://www.rivolitoronto.com', null, 'Independent', '334 Queen St W. Back room venue operating since 1982.'),
('El Mocambo', 'Toronto', 'CA', 400, 'club', 'booking@elmocambo.com', 'https://elmocambo.com', null, 'Independent', '464 Spadina Ave. Historic venue. Reopened 2021.'),
('The Garrison', 'Toronto', 'CA', 300, 'club', 'booking@garrisontoronto.com', 'https://www.garrisontoronto.com', null, 'Independent', '1197 Dundas St W. Indie/alternative bar-venue since 2009.'),

-- CHICAGO
('The Empty Bottle', 'Chicago', 'US', 400, 'bar', 'molly@emptybottle.com', 'https://www.emptybottle.com', 'Molly Neuman', 'Independent', '1035 N Western Ave, Ukrainian Village. CC cameron@emptybottle.com.'),
('The Hideout', 'Chicago', 'US', 200, 'bar', 'booking@hideoutchicago.com', 'https://hideoutchicago.com', null, 'Independent', '1354 W Wabansia Ave. Century-old house. Country/indie/rock.'),
('Subterranean', 'Chicago', 'US', 400, 'club', 'booking@subt.net', 'https://subt.net', null, 'Independent', '2011 W North Ave, Wicker Park.'),
('Beat Kitchen', 'Chicago', 'US', 200, 'bar', 'booking@subt.net', 'https://beatkitchen.com', 'John Ugolini', 'Kickstand Productions', '2100 W Belmont Ave. Also: john@kickstandproductions.net.'),
('Sleeping Village', 'Chicago', 'US', 450, 'club', 'booking@sleeping-village.com', 'https://sleeping-village.com', null, 'Independent', '3734 W Belmont Ave, Avondale.'),
('Metro Chicago', 'Chicago', 'US', 1150, 'theatre', 'ask@metrochicago.com', 'https://metrochicago.com', null, 'Independent', '3730 N Clark St, Wrigleyville. Legendary independent theatre since 1982.'),

-- AUSTIN
('The Continental Club', 'Austin', 'US', 200, 'bar', 'booking@continentalclub.com', 'https://continentalclub.com/austinclub', null, 'Independent', '1315 South Congress Ave. Austin institution since 1955.'),
('The Saxon Pub', 'Austin', 'US', 168, 'bar', 'saxonbooking@gmail.com', 'https://thesaxonpub.com', 'Dave Cotton', 'Independent', '1320 S Lamar Blvd.'),
('Mohawk', 'Austin', 'US', 1200, 'club', 'rosa@transmissionentertainment.com', 'https://mohawkaustin.com', 'Rosa / Graham Williams', 'Transmission Entertainment', '912 Red River St. Indoor (350) + outdoor stage (1200).'),
('The Parish', 'Austin', 'US', 450, 'club', 'booking@theparishaustin.com', 'https://www.theparishaustin.com', null, 'Transmission Entertainment', '214 E 6th St. Widely regarded as best sound in Austin.'),
('Antone''s', 'Austin', 'US', 450, 'club', 'booking@antonesnightclub.com', 'https://www.antonesnightclub.com', null, 'Independent', '305 E 5th St. World-Famous Home of the Blues since 1975.'),
('Hole in the Wall', 'Austin', 'US', 250, 'bar', 'holeinthewallbooking@gmail.com', 'https://www.holeinthewallaustin.com', null, 'Independent', '2538 Guadalupe St. Live music 7 nights.'),

-- NASHVILLE
('The Basement', 'Nashville', 'US', 175, 'bar', 'booking@thebasementnashville.com', 'https://www.thebasementnashville.com', null, 'Independent', '1604 8th Ave S. Small underground room.'),
('The Basement East', 'Nashville', 'US', 575, 'club', 'booking@thebasementnashville.com', 'https://www.thebasementnashville.com', 'Richard Sloven', 'Live Nation', '917 Woodland St, East Nashville.'),
('Exit/In', 'Nashville', 'US', 500, 'club', 'booking@exitin.com', 'https://exitin.com', 'Dan Merker', 'Independent', '2208 Elliston Place. Nashville institution since 1971.'),
('Blue Room at Third Man Records', 'Nashville', 'US', 200, 'club', 'nashvillestore@thirdmanrecords.com', 'https://thirdmanrecords.com/pages/nashville-store', null, 'Third Man Records', '623 7th Ave S. Intimate room at Jack White''s Nashville HQ.'),
('Rudy''s Jazz Room', 'Nashville', 'US', 95, 'bar', 'info@rudysjazzroom.com', 'https://www.rudysjazzroom.com', null, 'Independent', '809 Gleaves St, The Gulch. Nashville''s premier jazz club.'),
('Listening Room Cafe', 'Nashville', 'US', 300, 'theatre', 'booking@listeningroomcafe.com', 'https://listeningroomcafe.com/nashville', null, 'Independent', '618 4th Ave S. Songwriter-in-the-round format.'),

-- ATLANTA
('Variety Playhouse', 'Atlanta', 'US', 1000, 'theatre', 'info@zeromile.com', 'https://www.variety-playhouse.com', null, 'Zero Mile', '1099 Euclid Ave NE, Little Five Points.'),
('Terminal West', 'Atlanta', 'US', 1000, 'club', 'info@zeromile.com', 'https://www.terminalwestatl.com', null, 'Zero Mile', '887 W Marietta St NW, West Midtown.'),
('Mammal Gallery', 'Atlanta', 'US', 300, 'club', 'booking@mammalgallery.com', 'https://www.mammalgallery.com', 'William', 'Independent', 'Broad Street. Two-story DIY/indie/arts venue.'),
('The Masquerade', 'Atlanta', 'US', 1500, 'club', 'booking@masq.com', 'https://www.masq.com', null, 'Independent', 'Three rooms: Heaven/Hell/Purgatory. 695 North Ave NE.'),
('Eddie''s Attic', 'Atlanta', 'US', 200, 'theatre', 'booking@eddiesattic.com', 'https://www.eddiesattic.com', null, 'Independent', '515-B N McDonough St, Decatur. Intimate listening room.'),
('Drunken Unicorn', 'Atlanta', 'US', 300, 'club', 'booking@drunken-unicorn.com', 'https://www.drunken-unicorn.com', null, 'Independent', '736 Ponce De Leon Ave NE.'),

-- SEATTLE
('Neumos', 'Seattle', 'US', 700, 'club', 'info@neumos.com', 'https://www.neumos.com', 'Jason Lajeunesse', 'Neumos', '925 E Pike St, Capitol Hill. Flagship Seattle indie rock club since 2004.'),
('Chop Suey', 'Seattle', 'US', 500, 'club', 'booking@chopsuey.com', 'https://chopsuey.com', null, 'Independent', '1325 E Madison St, Capitol Hill. All-ages.'),
('Barboza', 'Seattle', 'US', 200, 'bar', 'booking@neumos.com', 'https://www.thebarboza.com', 'Jason Lajeunesse', 'Neumos', '925 E Pike St (below Neumos). Smaller room, same team.'),
('Tractor Tavern', 'Seattle', 'US', 430, 'bar', 'booking@tractortavern.com', 'https://tractortavern.com', null, 'Independent', '5213 Ballard Ave NW. Roots/country/folk/rock.'),
('El Corazón', 'Seattle', 'US', 800, 'club', 'booking@elcorazonseattle.com', 'https://www.elcorazonseattle.com', null, 'Independent', '109 Eastlake Ave E. Rock/metal/punk. Two rooms.'),
('The Vera Project', 'Seattle', 'US', 500, 'club', 'booking@theveraproject.org', 'https://theveraproject.org', null, 'Non-profit', '305 Harrison St, Seattle Center. All-ages non-profit venue.'),

-- BOSTON
('Middle East Downstairs', 'Boston', 'US', 575, 'club', 'aarong@mideastclub.com', 'https://mideastclub.com/downstairs/', 'Aaron Gray', 'Independent', '472 Massachusetts Ave, Cambridge.'),
('Middle East Upstairs', 'Boston', 'US', 194, 'bar', 'aarong@mideastclub.com', 'https://mideastclub.com', 'Aaron Gray', 'Independent', '472 Massachusetts Ave, Cambridge. Smaller room.'),
('Sonia (Middle East)', 'Boston', 'US', 350, 'club', 'kerryq@mideastclub.com', 'https://mideastclub.com', 'Kerry Quirk', 'Independent', 'Part of Middle East complex, Cambridge.'),
('Brighton Music Hall', 'Boston', 'US', 500, 'club', 'booking@crossroadspresents.com', 'https://crossroadspresents.com/pages/brighton-music-hall', null, 'Crossroads Presents', '158 Brighton Ave, Allston.'),
('Paradise Rock Club', 'Boston', 'US', 933, 'theatre', 'booking@crossroadspresents.com', 'https://crossroadspresents.com/pages/paradise-rock-club', null, 'Crossroads Presents', '967 Commonwealth Ave. National touring anchor in Boston.'),
('Scullers Jazz Club', 'Boston', 'US', 185, 'theatre', 'info@scullersjazz.com', 'https://www.scullersjazz.com', null, 'Independent', '400 Soldiers Field Rd. Boston''s premier jazz room.'),

-- SAN FRANCISCO
('The Independent SF', 'San Francisco', 'US', 500, 'club', 'booking@theindependentsf.com', 'https://www.theindependentsf.com', null, 'Another Planet Entertainment', '628 Divisadero St. Flagship APE small venue.'),
('Great American Music Hall', 'San Francisco', 'US', 600, 'theatre', 'info@gamh.com', 'https://gamh.com', null, 'Another Planet Entertainment', '859 O''Farrell St. SF''s longest-running independent venue.'),
('The Chapel', 'San Francisco', 'US', 500, 'theatre', 'booking@thechapelsf.com', 'https://www.thechapelsf.com', null, 'Independent', '777 Valencia St, Mission. 1914 former mortuary.'),
('Bottom of the Hill', 'San Francisco', 'US', 350, 'bar', 'booking@bottomofthehill.com', 'https://www.bottomofthehill.com', null, 'Independent', '1233 17th St, Potrero Hill. Indie rock staple.'),
('Brick & Mortar Music Hall', 'San Francisco', 'US', 250, 'club', 'booking@brickandmortarsf.com', 'https://www.brickandmortarsf.com', null, 'Independent', '1710 Mission St, Mission District.'),

-- MIAMI
('Gramps', 'Miami', 'US', 300, 'bar', 'booking@gramps.com', 'https://www.gramps.com', null, 'Embrace Presents', '176 NW 24th St, Wynwood. Indoor + large outdoor patio stage.'),
('Ball & Chain', 'Miami', 'US', 300, 'bar', 'info@ballandchainmiami.com', 'https://ballandchainmiami.com', null, 'Independent', '1513 SW 8th St, Little Havana. Historic Cuban-heritage venue.'),
('Kill Your Idol', 'Miami', 'US', 150, 'bar', 'booking@killyouridol.com', 'https://www.killyouridol.com', null, 'Independent', '222 Espanola Way, Miami Beach. Rock/punk/indie bar.'),
('The Ground', 'Miami', 'US', 555, 'club', 'booking@thegroundmiami.com', 'https://www.thegroundmiami.com', null, 'Independent', '34 NE 11th St, Downtown Miami. Multi-room electronic/indie club.'),
('Lagniappe', 'Miami', 'US', 200, 'bar', 'info@lagniappehouse.com', 'https://www.lagniappehouse.com', null, 'Independent', '3425 NE 2nd Ave, Wynwood/Midtown. Wine bar with live music nightly.'),

-- MANCHESTER
('Band on the Wall', 'Manchester', 'UK', 600, 'club', 'bookings@bandonthewall.org', 'https://bandonthewall.org', null, 'Independent', 'Swan Street, Northern Quarter. World music/jazz/indie/electronic.'),
('Night & Day Cafe', 'Manchester', 'UK', 250, 'bar', 'contact@nightnday.org', 'https://nightnday.org', null, 'Independent', '26 Oldham St, Northern Quarter. Live music most nights.'),
('The Deaf Institute', 'Manchester', 'UK', 260, 'club', 'bookings@thedeafinstitute.co.uk', 'https://www.thedeafinstitute.co.uk', null, 'Mission Mars', '135 Grosvenor St, Oxford Road corridor.'),
('SOUP Manchester', 'Manchester', 'UK', 300, 'club', 'info@soupmanchester.com', 'https://soupmanchester.com', null, 'Independent', '31-33 Spear St, Northern Quarter.'),
('Eastern Bloc', 'Manchester', 'UK', 75, 'bar', 'easternblocevents@gmail.com', 'https://easternblocrecords.com', 'Ben', 'Independent', '5a Stevenson Square. Record shop + tiny venue.'),
('Matt and Phreds Jazz Club', 'Manchester', 'UK', 200, 'bar', 'info@mattandphreds.com', 'https://www.mattandphreds.com', null, 'Independent', '64 Tib St, Northern Quarter. Jazz-focused.'),

-- SYDNEY
('Oxford Art Factory', 'Sydney', 'AU', 700, 'club', 'band@oxfordartfactory.com', 'https://oxfordartfactory.com', null, 'Independent', '38-46 Oxford St, Darlinghurst. Two-room venue.'),
('Metro Theatre Sydney', 'Sydney', 'AU', 1000, 'theatre', 'info@metrotheatre.com.au', 'https://www.metrotheatre.com.au', null, 'Secret Sounds', '624 George St, CBD.'),
('Enmore Theatre', 'Sydney', 'AU', 2500, 'theatre', 'info@enmoretheatre.com.au', 'https://www.enmoretheatre.com.au', null, 'Secret Sounds', '118-132 Enmore Rd, Newtown.'),
('Manning Bar', 'Sydney', 'AU', 1000, 'club', 'bookings@manningbar.com.au', 'https://www.manningbar.com.au', null, 'USU', 'Manning House, University of Sydney. Strong live music history.'),
('The Vanguard', 'Sydney', 'AU', 280, 'theatre', 'info@thevanguard.com.au', 'https://www.thevanguard.com.au', null, 'Independent', '42 King St, Newtown. Seated dinner/show venue.'),

-- MELBOURNE
('Corner Hotel', 'Melbourne', 'AU', 700, 'bar', 'functions@cornerhotel.com', 'https://cornerhotel.com', null, 'Independent', '57 Swan St, Richmond. Melbourne''s most important indie venue.'),
('Northcote Social Club', 'Melbourne', 'AU', 500, 'bar', 'bar@northcotesocialclub.com', 'https://northcotesocialclub.com', null, 'Independent', '301 High St, Northcote.'),
('Howler', 'Melbourne', 'AU', 700, 'club', 'info@howlerbrunswick.com', 'https://www.howlerbrunswick.com', null, 'Independent', '7-11 Dawson St, Brunswick.'),
('The Evelyn Hotel', 'Melbourne', 'AU', 400, 'bar', 'info@evelynhotel.com.au', 'https://evelynhotel.com.au', null, 'Independent', '351 Brunswick St, Fitzroy. Live music 7 nights a week.'),
('Prince Bandroom', 'Melbourne', 'AU', 800, 'club', 'info@theprince.com.au', 'https://theprince.com.au/prince-bandroom/', null, 'Independent', '2 Acland St, St Kilda.'),

-- DALLAS
('Trees', 'Dallas', 'US', 700, 'club', 'booking@treesdallas.com', 'https://treesdallas.com', null, 'Independent', '2709 Elm St, Deep Ellum. World-famous venue since 1990.'),
('Deep Ellum Art Co.', 'Dallas', 'US', 800, 'club', 'info@deepellumart.co', 'https://www.deepellumart.co', null, 'Independent', '3200 Commerce St, Deep Ellum. Indoor + outdoor stages.'),
('Three Links', 'Dallas', 'US', 300, 'bar', 'booking@threelinksdeepellum.com', 'https://www.threelinksdeepellum.com', null, 'Independent', '2704 Elm St, Deep Ellum. Small indie rock bar.'),
('Club Dada', 'Dallas', 'US', 250, 'bar', 'booking@dadabar.com', 'https://www.dadabar.com', 'Annette Marin', 'Spune Productions', '2720 Elm St, Deep Ellum.'),
('The Kessler Theater', 'Dallas', 'US', 550, 'theatre', 'booking@thekessler.org', 'https://thekessler.org', null, 'Independent', '1230 W Davis St, Oak Cliff. Americana/roots/singer-songwriter.'),

-- DENVER
('Larimer Lounge', 'Denver', 'US', 350, 'bar', 'haylee@larimerlounge.com', 'https://larimerlounge.com', 'Kyle Hartman', 'Independent', '2721 Larimer St, RiNo. Since 2002.'),
('Hi-Dive', 'Denver', 'US', 300, 'bar', 'booking@hi-dive.com', 'https://hi-dive.com', 'Maggie Moody', 'Independent', '7 S Broadway. Small indie rock bar.'),
('Globe Hall', 'Denver', 'US', 400, 'club', 'info@globehall.com', 'https://globehall.com', null, 'Independent', '4483 Logan St, Cole neighborhood. BBQ + live music.'),
('Bluebird Theater', 'Denver', 'US', 550, 'theatre', 'info@bluebirdtheater.net', 'https://bluebirdtheater.net', 'Evan Marks', 'AEG Presents Rocky Mountain', '3317 E Colfax Ave. AEG-operated since 2006.'),
('Ogden Theatre', 'Denver', 'US', 1600, 'theatre', 'info@ogdentheatre.com', 'https://www.ogdentheatre.com', 'Evan Marks', 'AEG Presents Rocky Mountain', '935 E Colfax Ave. Premier mid-size Denver theatre.'),

-- BERLIN
('SO36', 'Berlin', 'DE', 800, 'club', 'booking@so36.com', 'https://www.so36.de', null, 'Independent', 'Oranienstr. 190, Kreuzberg. Legendary punk/alternative/queer venue since 1978.'),
('Lido', 'Berlin', 'DE', 600, 'club', 'info@lido-berlin.de', 'https://www.lido-berlin.de', null, 'Independent', 'Cuvrystr. 7, Kreuzberg. Indie-rock/electro-pop club.'),
('Cassiopeia', 'Berlin', 'DE', 800, 'club', 'info@cassiopeia-berlin.de', 'https://cassiopeia-berlin.de', null, 'Independent', 'Revaler Str. 99, Friedrichshain. Multi-floor industrial hall.'),
('Privatclub', 'Berlin', 'DE', 250, 'club', 'info@privatclub-berlin.de', 'https://www.privatclub-berlin.de', null, 'Independent', 'Skalitzer Str. 85-86, Kreuzberg. Small underground club.'),
('Musik und Frieden', 'Berlin', 'DE', 700, 'club', 'booking@musikundfrieden.de', 'https://www.musikundfrieden.de', null, 'Independent', 'Falckensteinstr. 48, Kreuzberg. Three rooms.'),
('Wild at Heart', 'Berlin', 'DE', 150, 'bar', 'info@wildatheartberlin.de', 'http://www.wildatheartberlin.de', null, 'Independent', 'Wiener Str. 20, Kreuzberg. Legendary punk/rockabilly bar.'),
('Huxley''s Neue Welt', 'Berlin', 'DE', 1600, 'theatre', 'booking@huxleysneuewelt.com', 'https://www.huxleysneuewelt.com', null, 'Independent', 'Hasenheide 107, Neukölln. 1920s ballroom.'),
('Silent Green Kulturquartier', 'Berlin', 'DE', 500, 'theatre', 'info@silent-green.net', 'https://www.silent-green.net', null, 'Independent', 'Gerichtstr. 35, Wedding. Former crematorium. Experimental/electronic.'),

-- AMSTERDAM
('Paradiso', 'Amsterdam', 'NL', 1500, 'theatre', 'info@paradiso.nl', 'https://www.paradiso.nl/en', null, 'Paradiso/Melkweg Production House', 'Weteringschans 6-8. Iconic former church.'),
('Melkweg', 'Amsterdam', 'NL', 1500, 'club', 'info@melkweg.nl', 'https://www.melkweg.nl/en', null, 'Paradiso/Melkweg Production House', 'Lijnbaansgracht 234a. Non-profit multi-purpose. Two halls.'),
('Bitterzoet', 'Amsterdam', 'NL', 350, 'club', 'info@bitterzoet.com', 'https://www.bitterzoet.com', null, 'Independent', 'Spuistraat 2. Rock/punk/hip-hop/soul.'),
('De Nieuwe Anita', 'Amsterdam', 'NL', 100, 'bar', 'booking@denieuweanita.nl', 'https://denieuweanita.nl', null, 'Independent', 'Frederik Hendrikstraat 111. Small alternative/indie venue.'),
('OCCII', 'Amsterdam', 'NL', 200, 'club', 'contact@occii.org', 'https://occii.org', null, 'Collective', 'Amstelveenseweg 134. DIY underground venue since 1992.'),

-- PARIS
('La Maroquinerie', 'Paris', 'FR', 500, 'theatre', 'contact@lamaroquinerie.fr', 'https://www.lamaroquinerie.fr', null, 'Independent', '23 Rue Boyer, 75020 Ménilmontant.'),
('Le Trabendo', 'Paris', 'FR', 700, 'club', 'pablo@letrabendo.net', 'https://www.letrabendo.net', 'Pablo El Baz', 'Independent', 'Parc de la Villette, 75019. ~160 concerts/year.'),
('La Cigale', 'Paris', 'FR', 1500, 'theatre', 'accueil@lacigale.fr', 'https://lacigale.fr', null, 'Independent', '120 Blvd de Rochechouart, 75018 Pigalle. Art Nouveau hall.'),
('Supersonic', 'Paris', 'FR', 300, 'club', 'booking@supersonic.paris', 'https://supersonic.paris', null, 'Independent', '9 Rue Biscornet, 75012 Bastille area. Free/cheap rock shows nightly.'),
('Le Bataclan', 'Paris', 'FR', 1500, 'theatre', 'contact@bataclan.fr', 'https://www.bataclan.fr', null, 'Live Nation', '50 Blvd Voltaire, 75011. Historic venue.'),
('Cabaret Sauvage', 'Paris', 'FR', 1500, 'theatre', 'info@cabaretsauvage.com', 'https://www.cabaretsauvage.com', null, 'Independent', '59 Blvd Macdonald, 75019 La Villette. Circus-tent shaped.');
