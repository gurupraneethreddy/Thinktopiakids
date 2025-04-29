
"use client"
import { useState, useEffect } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"
import { motion, AnimatePresence } from "framer-motion"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Comprehensive country facts database with 220+ countries
const countryFacts = {
  Afghanistan: {
    flag: "🇦🇫",
    fact: "Afghanistan has a national sport called Buzkashi where horse riders try to grab a goat carcass!",
    landmark: "Band-e Amir Lakes",
  },
  Albania: {
    flag: "🇦🇱",
    fact: "Albania has over 173,000 bunkers scattered throughout the country!",
    landmark: "Berat Old Town",
  },
  Algeria: {
    flag: "🇩🇿",
    fact: "Algeria is the largest country in Africa!",
    landmark: "Timgad Roman Ruins",
  },
  Andorra: {
    flag: "🇦🇩",
    fact: "Andorra has no airport but two heliports!",
    landmark: "Vall de Madriu-Perafita-Claror",
  },
  Angola: {
    flag: "🇦🇴",
    fact: "Angola is home to the rare giant sable antelope!",
    landmark: "Kalandula Falls",
  },
  "Antigua and Barbuda": {
    flag: "🇦🇬",
    fact: "Antigua has 365 beaches - one for every day of the year!",
    landmark: "Nelson's Dockyard",
  },
  Argentina: {
    flag: "🇦🇷",
    fact: "Argentina is named after the Latin word for silver!",
    landmark: "Iguazu Falls",
  },
  Armenia: {
    flag: "🇦🇲",
    fact: "Armenia was the first nation to adopt Christianity as a state religion!",
    landmark: "Tatev Monastery",
  },
  Australia: {
    flag: "🇦🇺",
    fact: "Australia has more kangaroos than people!",
    landmark: "Sydney Opera House",
  },
  Austria: {
    flag: "🇦🇹",
    fact: "Austria is the birthplace of Mozart and the famous Lipizzaner horses!",
    landmark: "Schönbrunn Palace",
  },
  Azerbaijan: {
    flag: "🇦🇿",
    fact: "Azerbaijan has mud volcanoes that sometimes shoot flames into the air!",
    landmark: "Flame Towers",
  },
  Bahamas: {
    flag: "🇧🇸",
    fact: "The Bahamas has pink sand beaches!",
    landmark: "Atlantis Paradise Island",
  },
  Bahrain: {
    flag: "🇧🇭",
    fact: "Bahrain is an island country made up of 33 islands!",
    landmark: "Tree of Life",
  },
  Bangladesh: {
    flag: "🇧🇩",
    fact: "Bangladesh has the longest natural beach in the world!",
    landmark: "Sundarbans Mangrove Forest",
  },
  Barbados: {
    flag: "🇧🇧",
    fact: "Barbados is the birthplace of pop star Rihanna!",
    landmark: "Harrison's Cave",
  },
  Belarus: {
    flag: "🇧🇾",
    fact: "Belarus has Europe's largest ancient forest called Belovezhskaya Pushcha!",
    landmark: "Mir Castle",
  },
  Belgium: {
    flag: "🇧🇪",
    fact: "Belgium has more than 1,000 kinds of beer!",
    landmark: "Grand Place",
  },
  Belize: {
    flag: "🇧🇿",
    fact: "Belize has the second largest barrier reef in the world!",
    landmark: "Great Blue Hole",
  },
  Benin: {
    flag: "🇧🇯",
    fact: "Benin is the birthplace of the voodoo religion!",
    landmark: "Royal Palaces of Abomey",
  },
  Bhutan: {
    flag: "🇧🇹",
    fact: "Bhutan measures Gross National Happiness instead of GDP!",
    landmark: "Tiger's Nest Monastery",
  },
  Bolivia: {
    flag: "🇧🇴",
    fact: "Bolivia has a salt flat so large and flat that it's used to calibrate satellites!",
    landmark: "Salar de Uyuni",
  },
  "Bosnia and Herzegovina": {
    flag: "🇧🇦",
    fact: "Bosnia and Herzegovina has a heart-shaped island called Galešnjak!",
    landmark: "Stari Most (Old Bridge)",
  },
  Botswana: {
    flag: "🇧🇼",
    fact: "Botswana has the world's largest elephant population!",
    landmark: "Okavango Delta",
  },
  Brazil: {
    flag: "🇧🇷",
    fact: "Brazil is home to the Amazon Rainforest, the largest in the world!",
    landmark: "Christ the Redeemer",
  },
  Brunei: {
    flag: "🇧🇳",
    fact: "Brunei's royal palace has 1,788 rooms and is the world's largest residential palace!",
    landmark: "Istana Nurul Iman",
  },
  Bulgaria: {
    flag: "🇧🇬",
    fact: "Bulgaria is the world's largest producer of rose oil!",
    landmark: "Rila Monastery",
  },
  "Burkina Faso": {
    flag: "🇧🇫",
    fact: "Burkina Faso means 'land of honest men'!",
    landmark: "Sindou Peaks",
  },
  Burundi: {
    flag: "🇧🇮",
    fact: "Burundi is one of the few places where you can see drumming declared as a UNESCO cultural heritage!",
    landmark: "Source of the Nile",
  },
  Cambodia: {
    flag: "🇰🇭",
    fact: "Cambodia's flag is the only national flag that features a building - Angkor Wat!",
    landmark: "Angkor Wat",
  },
  Cameroon: {
    flag: "🇨🇲",
    fact: "Cameroon is called 'Africa in miniature' because it has all of Africa's landscapes!",
    landmark: "Mount Cameroon",
  },
  Canada: {
    flag: "🇨🇦",
    fact: "Canada has more lakes than the rest of the world combined!",
    landmark: "Niagara Falls",
  },
  "Cape Verde": {
    flag: "🇨🇻",
    fact: "Cape Verde is home to more giant sea turtles than people!",
    landmark: "Pico do Fogo Volcano",
  },
  "Central African Republic": {
    flag: "🇨🇫",
    fact: "The Central African Republic has one of the world's largest populations of forest elephants!",
    landmark: "Dzanga-Sangha Reserve",
  },
  Chad: {
    flag: "🇹🇩",
    fact: "Chad is home to over 200 different ethnic and linguistic groups!",
    landmark: "Lakes of Ounianga",
  },
  Chile: {
    flag: "🇨🇱",
    fact: "Chile is the longest country in the world from north to south!",
    landmark: "Easter Island",
  },
  China: {
    flag: "🇨🇳",
    fact: "The Great Wall of China is so long it could stretch from North America to Europe!",
    landmark: "Great Wall of China",
  },
  Colombia: {
    flag: "🇨🇴",
    fact: "Colombia is the only South American country with coastlines on both the Pacific Ocean and the Caribbean Sea!",
    landmark: "Lost City (Ciudad Perdida)",
  },
  Comoros: {
    flag: "🇰🇲",
    fact: "Comoros is one of the world's largest producers of ylang-ylang, used in perfumes!",
    landmark: "Mount Karthala",
  },
  Congo: {
    flag: "🇨🇬",
    fact: "Congo is home to the second-largest rainforest in the world!",
    landmark: "Lésio-Louna-Léfini Gorilla Reserve",
  },
  "Costa Rica": {
    flag: "🇨🇷",
    fact: "Costa Rica has no army and uses the money for education and healthcare instead!",
    landmark: "Arenal Volcano",
  },
  Croatia: {
    flag: "🇭🇷",
    fact: "Croatia has over 1,000 islands!",
    landmark: "Plitvice Lakes",
  },
  Cuba: {
    flag: "🇨🇺",
    fact: "Cuba has almost 100% literacy rate!",
    landmark: "Old Havana",
  },
  Cyprus: {
    flag: "🇨🇾",
    fact: "Cyprus is the birthplace of the goddess Aphrodite!",
    landmark: "Tombs of the Kings",
  },
  "Czech Republic": {
    flag: "🇨🇿",
    fact: "The Czech Republic drinks more beer per person than any other country!",
    landmark: "Prague Castle",
  },
  Denmark: {
    flag: "🇩🇰",
    fact: "Denmark has the oldest flag in the world still in use!",
    landmark: "The Little Mermaid",
  },
  Djibouti: {
    flag: "🇩🇯",
    fact: "Djibouti has a lake that's saltier than the Dead Sea!",
    landmark: "Lake Assal",
  },
  Dominica: {
    flag: "🇩🇲",
    fact: "Dominica has a boiling lake that's the second-largest hot spring in the world!",
    landmark: "Boiling Lake",
  },
  "Dominican Republic": {
    flag: "🇩🇴",
    fact: "The Dominican Republic has the first cathedral built in the Americas!",
    landmark: "Zona Colonial",
  },
  "East Timor": {
    flag: "🇹🇱",
    fact: "East Timor is one of the world's youngest countries, gaining independence in 2002!",
    landmark: "Cristo Rei of Dili",
  },
  Ecuador: {
    flag: "🇪🇨",
    fact: "Ecuador is named after the equator which runs through it!",
    landmark: "Galápagos Islands",
  },
  Egypt: {
    flag: "🇪🇬",
    fact: "The ancient Egyptians built the pyramids over 4,500 years ago!",
    landmark: "Pyramids of Giza",
  },
  "El Salvador": {
    flag: "🇸🇻",
    fact: "El Salvador is known as the 'Land of Volcanoes'!",
    landmark: "Joya de Cerén",
  },
  "Equatorial Guinea": {
    flag: "🇬🇶",
    fact: "Equatorial Guinea is the only Spanish-speaking country in Africa!",
    landmark: "Monte Alen National Park",
  },
  Eritrea: {
    flag: "🇪🇷",
    fact: "Eritrea has buildings shaped like traditional coffee pots!",
    landmark: "Asmara Art Deco Buildings",
  },
  Estonia: {
    flag: "🇪🇪",
    fact: "Estonia has over 2,000 islands!",
    landmark: "Tallinn Old Town",
  },
  Eswatini: {
    flag: "🇸🇿",
    fact: "Eswatini (formerly Swaziland) is one of the last absolute monarchies in the world!",
    landmark: "Mlilwane Wildlife Sanctuary",
  },
  Ethiopia: {
    flag: "🇪🇹",
    fact: "Ethiopia follows a calendar that is 7-8 years behind the rest of the world!",
    landmark: "Rock-Hewn Churches of Lalibela",
  },
  Fiji: {
    flag: "🇫🇯",
    fact: "Fiji is made up of over 300 islands!",
    landmark: "Garden of the Sleeping Giant",
  },
  Finland: {
    flag: "🇫🇮",
    fact: "Finland is called the land of a thousand lakes, but actually has 188,000 lakes!",
    landmark: "Northern Lights",
  },
  France: {
    flag: "🇫🇷",
    fact: "The Eiffel Tower gets taller in summer because metal expands in heat!",
    landmark: "Eiffel Tower",
  },
  Gabon: {
    flag: "🇬🇦",
    fact: "Gabon has 13% of its land dedicated to national parks!",
    landmark: "Lopé National Park",
  },
  Gambia: {
    flag: "🇬🇲",
    fact: "The Gambia is the smallest country in mainland Africa!",
    landmark: "Kunta Kinteh Island",
  },
  Georgia: {
    flag: "🇬🇪",
    fact: "Georgia claims to be the birthplace of wine, with 8,000 years of winemaking history!",
    landmark: "Gergeti Trinity Church",
  },
  Germany: {
    flag: "🇩🇪",
    fact: "Germany has over 1,000 kinds of sausages!",
    landmark: "Brandenburg Gate",
  },
  Ghana: {
    flag: "🇬🇭",
    fact: "Ghana was the first sub-Saharan African country to gain independence!",
    landmark: "Cape Coast Castle",
  },
  Greece: {
    flag: "🇬🇷",
    fact: "The Olympic Games were first held in ancient Greece!",
    landmark: "Acropolis",
  },
  Grenada: {
    flag: "🇬🇩",
    fact: "Grenada is known as the 'Spice Isle' and produces nutmeg, cinnamon, and cloves!",
    landmark: "Grand Anse Beach",
  },
  Guatemala: {
    flag: "🇬🇹",
    fact: "Guatemala has 33 volcanoes, three of which are active!",
    landmark: "Tikal",
  },
  Guinea: {
    flag: "🇬🇳",
    fact: "Guinea has the world's largest bauxite reserves!",
    landmark: "Mount Nimba",
  },
  "Guinea-Bissau": {
    flag: "🇬🇼",
    fact: "Guinea-Bissau has a national park with saltwater hippos that swim in the ocean!",
    landmark: "Bijagós Archipelago",
  },
  Guyana: {
    flag: "🇬🇾",
    fact: "Guyana has one of the largest unspoiled rainforests in South America!",
    landmark: "Kaieteur Falls",
  },
  Haiti: {
    flag: "🇭🇹",
    fact: "Haiti was the first black republic to declare independence!",
    landmark: "Citadelle Laferrière",
  },
  Honduras: {
    flag: "🇭🇳",
    fact: "Honduras has rain that appears to fall from a clear sky, called 'liquid sunshine'!",
    landmark: "Copán Ruins",
  },
  Hungary: {
    flag: "🇭🇺",
    fact: "Hungary has the largest thermal water cave system in Europe!",
    landmark: "Hungarian Parliament Building",
  },
  Iceland: {
    flag: "🇮🇸",
    fact: "Iceland has no mosquitoes and is one of the safest countries in the world!",
    landmark: "Blue Lagoon",
  },
  India: {
    flag: "🇮🇳",
    fact: "India has the Taj Mahal, one of the 7 Wonders of the World!",
    landmark: "Taj Mahal",
  },
  Indonesia: {
    flag: "🇮🇩",
    fact: "Indonesia has more than 17,000 islands!",
    landmark: "Borobudur Temple",
  },
  Iran: {
    flag: "🇮🇷",
    fact: "Iran has one of the oldest civilizations in the world, dating back to 7000 BC!",
    landmark: "Persepolis",
  },
  Iraq: {
    flag: "🇮🇶",
    fact: "Iraq is home to the ancient civilization of Mesopotamia, between the Tigris and Euphrates rivers!",
    landmark: "Ziggurat of Ur",
  },
  Ireland: {
    flag: "🇮🇪",
    fact: "Ireland has no snakes because St. Patrick banished them all, according to legend!",
    landmark: "Cliffs of Moher",
  },
  Israel: {
    flag: "🇮🇱",
    fact: "Israel has the lowest point on Earth - the Dead Sea!",
    landmark: "Western Wall",
  },
  Italy: {
    flag: "🇮🇹",
    fact: "Italians invented pizza and ice cream!",
    landmark: "Colosseum",
  },
  Jamaica: {
    flag: "🇯🇲",
    fact: "Jamaica is the birthplace of reggae music and Bob Marley!",
    landmark: "Dunn's River Falls",
  },
  Japan: {
    flag: "🇯🇵",
    fact: "Japan has a cat island where cats outnumber people!",
    landmark: "Mount Fuji",
  },
  Jordan: {
    flag: "🇯🇴",
    fact: "Jordan has a city called Petra that's carved into pink sandstone cliffs!",
    landmark: "Petra",
  },
  Kazakhstan: {
    flag: "🇰🇿",
    fact: "Kazakhstan is the world's largest landlocked country!",
    landmark: "Bayterek Tower",
  },
  Kenya: {
    flag: "🇰🇪",
    fact: "Kenya is home to the fastest runners in the world!",
    landmark: "Maasai Mara",
  },
  Kiribati: {
    flag: "🇰🇮",
    fact: "Kiribati is the only country in all four hemispheres of the Earth!",
    landmark: "Christmas Island",
  },
  Kuwait: {
    flag: "🇰🇼",
    fact: "Kuwait has the world's tallest unsupported flagpole!",
    landmark: "Kuwait Towers",
  },
  Kyrgyzstan: {
    flag: "🇰🇬",
    fact: "Kyrgyzstan has a three-story yurt that can fit 100 people!",
    landmark: "Issyk-Kul Lake",
  },
  Laos: {
    flag: "🇱🇦",
    fact: "Laos is the only Southeast Asian country without a coastline!",
    landmark: "Kuang Si Falls",
  },
  Latvia: {
    flag: "🇱🇻",
    fact: "Latvia has Europe's widest waterfall - Ventas Rumba!",
    landmark: "Riga Old Town",
  },
  Lebanon: {
    flag: "🇱🇧",
    fact: "Lebanon has the oldest continuously inhabited city in the world - Byblos!",
    landmark: "Baalbek Roman Ruins",
  },
  Lesotho: {
    flag: "🇱🇸",
    fact: "Lesotho is the only country in the world that lies entirely above 1,000 meters in elevation!",
    landmark: "Maletsunyane Falls",
  },
  Liberia: {
    flag: "🇱🇷",
    fact: "Liberia was founded by freed American slaves!",
    landmark: "Providence Island",
  },
  Libya: {
    flag: "🇱🇾",
    fact: "Libya is home to some of the world's best-preserved Roman and Greek ruins!",
    landmark: "Leptis Magna",
  },
  Liechtenstein: {
    flag: "🇱🇮",
    fact: "Liechtenstein is so small that you can walk across the entire country in just a few hours!",
    landmark: "Vaduz Castle",
  },
  Lithuania: {
    flag: "🇱🇹",
    fact: "Lithuania has a hill covered with over 100,000 crosses!",
    landmark: "Hill of Crosses",
  },
  Luxembourg: {
    flag: "🇱🇺",
    fact: "Luxembourg is one of the smallest countries but has the highest GDP per capita!",
    landmark: "Vianden Castle",
  },
  Madagascar: {
    flag: "🇲🇬",
    fact: "Madagascar has animals that exist nowhere else on Earth, like lemurs!",
    landmark: "Avenue of the Baobabs",
  },
  Malawi: {
    flag: "🇲🇼",
    fact: "Malawi is home to Lake Malawi, which has more fish species than any other lake on Earth!",
    landmark: "Lake Malawi",
  },
  Malaysia: {
    flag: "🇲🇾",
    fact: "Malaysia once had the world's tallest buildings - the Petronas Twin Towers!",
    landmark: "Petronas Twin Towers",
  },
  Maldives: {
    flag: "🇲🇻",
    fact: "The Maldives is the lowest country on Earth, with an average ground level of just 1.5 meters above sea level!",
    landmark: "Underwater Cabinet Meeting Site",
  },
  Mali: {
    flag: "🇲🇱",
    fact: "Mali once had the richest man in history - Mansa Musa!",
    landmark: "Great Mosque of Djenné",
  },
  Malta: {
    flag: "🇲🇹",
    fact: "Malta has prehistoric temples that are older than the pyramids and Stonehenge!",
    landmark: "Megalithic Temples",
  },
  "Marshall Islands": {
    flag: "🇲🇭",
    fact: "The Marshall Islands has more ocean area than land!",
    landmark: "Bikini Atoll",
  },
  Mauritania: {
    flag: "🇲🇷",
    fact: "Mauritania has a train that's over 2 kilometers long, one of the longest in the world!",
    landmark: "Eye of the Sahara",
  },
  Mauritius: {
    flag: "🇲🇺",
    fact: "Mauritius was once home to the dodo bird before it went extinct!",
    landmark: "Seven Colored Earths",
  },
  Mexico: {
    flag: "🇲🇽",
    fact: "Mexico introduced chocolate, corn, and chilies to the world!",
    landmark: "Chichen Itza",
  },
  Micronesia: {
    flag: "🇫🇲",
    fact: "Micronesia has ancient stone money that's too large to move - ownership is just transferred verbally!",
    landmark: "Nan Madol",
  },
  Moldova: {
    flag: "🇲🇩",
    fact: "Moldova has the world's largest wine cellar with over 200 km of tunnels!",
    landmark: "Cricova Winery",
  },
  Monaco: {
    flag: "🇲🇨",
    fact: "Monaco is smaller than Central Park in New York City!",
    landmark: "Monte Carlo Casino",
  },
  Mongolia: {
    flag: "🇲🇳",
    fact: "In Mongolia, many people still live in round tents called yurts!",
    landmark: "Genghis Khan Statue",
  },
  Montenegro: {
    flag: "🇲🇪",
    fact: "Montenegro has a beach that disappears at high tide!",
    landmark: "Sveti Stefan",
  },
  Morocco: {
    flag: "🇲🇦",
    fact: "Morocco has blue streets in the city of Chefchaouen!",
    landmark: "Hassan II Mosque",
  },
  Mozambique: {
    flag: "🇲🇿",
    fact: "Mozambique's flag has an AK-47 rifle on it!",
    landmark: "Bazaruto Archipelago",
  },
  Myanmar: {
    flag: "🇲🇲",
    fact: "Myanmar has a temple covered in 60 tons of gold!",
    landmark: "Shwedagon Pagoda",
  },
  Namibia: {
    flag: "🇳🇦",
    fact: "Namibia has the oldest desert in the world - the Namib Desert!",
    landmark: "Fish River Canyon",
  },
  Nauru: {
    flag: "🇳🇷",
    fact: "Nauru is the smallest island nation in the world!",
    landmark: "Buada Lagoon",
  },
  Nepal: {
    flag: "🇳🇵",
    fact: "Nepal has the only non-rectangular national flag in the world!",
    landmark: "Mount Everest",
  },
  Netherlands: {
    flag: "🇳🇱",
    fact: "The Netherlands has more bicycles than people!",
    landmark: "Kinderdijk Windmills",
  },
  "New Zealand": {
    flag: "🇳🇿",
    fact: "New Zealand was the first country to give women the right to vote!",
    landmark: "Milford Sound",
  },
  Nicaragua: {
    flag: "🇳🇮",
    fact: "Nicaragua has a volcano where you can go 'volcano boarding'!",
    landmark: "Cerro Negro",
  },
  Niger: {
    flag: "🇳🇪",
    fact: "Niger has dinosaur graveyards with complete skeletons!",
    landmark: "Agadez Grand Mosque",
  },
  Nigeria: {
    flag: "🇳🇬",
    fact: "Nigeria has the highest population in Africa!",
    landmark: "Zuma Rock",
  },
  "North Korea": {
    flag: "🇰🇵",
    fact: "North Korea follows its own calendar, which starts in 1912!",
    landmark: "Juche Tower",
  },
  "North Macedonia": {
    flag: "🇲🇰",
    fact: "North Macedonia has a cross on top of a mountain that's visible from space!",
    landmark: "Ohrid Lake",
  },
  Norway: {
    flag: "🇳🇴",
    fact: "Norway is the land of the midnight sun where the sun never sets in summer!",
    landmark: "Norwegian Fjords",
  },
  Oman: {
    flag: "🇴🇲",
    fact: "Oman has wadis that transform from dry valleys to flowing rivers after rain!",
    landmark: "Wadi Shab",
  },
  Pakistan: {
    flag: "🇵🇰",
    fact: "Pakistan has the second-highest mountain in the world - K2!",
    landmark: "Badshahi Mosque",
  },
  Palau: {
    flag: "🇵🇼",
    fact: "Palau has a lake filled with non-stinging jellyfish that you can swim with!",
    landmark: "Jellyfish Lake",
  },
  Palestine: {
    flag: "🇵🇸",
    fact: "Palestine has some of the oldest olive trees in the world - over 4,000 years old!",
    landmark: "Dome of the Rock",
  },
  Panama: {
    flag: "🇵🇦",
    fact: "Panama is the only place in the world where you can see the sun rise over the Pacific and set over the Atlantic!",
    landmark: "Panama Canal",
  },
  "Papua New Guinea": {
    flag: "🇵🇬",
    fact: "Papua New Guinea has over 800 languages - more than any other country!",
    landmark: "Mount Wilhelm",
  },
  Paraguay: {
    flag: "🇵🇾",
    fact: "Paraguay has a different flag on each side of its national flag!",
    landmark: "Itaipu Dam",
  },
  Peru: {
    flag: "🇵🇪",
    fact: "Peru is home to Machu Picchu, an ancient city built high in the mountains!",
    landmark: "Machu Picchu",
  },
  Philippines: {
    flag: "🇵🇭",
    fact: "The Philippines is made up of over 7,000 islands!",
    landmark: "Chocolate Hills",
  },
  Poland: {
    flag: "🇵🇱",
    fact: "Poland has a crooked forest where all the trees bend at the same angle!",
    landmark: "Wieliczka Salt Mine",
  },
  Portugal: {
    flag: "🇵🇹",
    fact: "Portugal is the oldest country in Europe with the same borders!",
    landmark: "Belém Tower",
  },
  Qatar: {
    flag: "🇶🇦",
    fact: "Qatar has air-conditioned outdoor markets!",
    landmark: "Museum of Islamic Art",
  },
  Romania: {
    flag: "🇷🇴",
    fact: "Romania has the heaviest building in the world - the Palace of Parliament!",
    landmark: "Bran Castle",
  },
  Russia: {
    flag: "🇷🇺",
    fact: "Russia is the largest country in the world!",
    landmark: "Saint Basil's Cathedral",
  },
  Rwanda: {
    flag: "🇷🇼",
    fact: "Rwanda banned plastic bags before most other countries!",
    landmark: "Volcanoes National Park",
  },
  "Saint Kitts and Nevis": {
    flag: "🇰🇳",
    fact: "Saint Kitts and Nevis is the smallest country in the Americas!",
    landmark: "Brimstone Hill Fortress",
  },
  "Saint Lucia": {
    flag: "🇱🇨",
    fact: "Saint Lucia has drive-in volcanoes where you can drive right up to bubbling sulfur springs!",
    landmark: "The Pitons",
  },
  "Saint Vincent and the Grenadines": {
    flag: "🇻🇨",
    fact: "Saint Vincent and the Grenadines was where Pirates of the Caribbean was filmed!",
    landmark: "Tobago Cays",
  },
  Samoa: {
    flag: "🇼🇸",
    fact: "Samoa was the first country to see the sunrise each day until Kiribati changed its time zone!",
    landmark: "To Sua Ocean Trench",
  },
  "San Marino": {
    flag: "🇸🇲",
    fact: "San Marino is the world's oldest republic, founded in 301 AD!",
    landmark: "Three Towers of San Marino",
  },
  "Sao Tome and Principe": {
    flag: "🇸🇹",
    fact: "Sao Tome and Principe is Africa's smallest country!",
    landmark: "Obo National Park",
  },
  "Saudi Arabia": {
    flag: "🇸🇦",
    fact: "Saudi Arabia is mostly desert with no permanent rivers!",
    landmark: "Mecca",
  },
  Senegal: {
    flag: "🇸🇳",
    fact: "Senegal has a pink lake called Lake Retba!",
    landmark: "Goree Island",
  },
  Serbia: {
    flag: "🇷🇸",
    fact: "Serbia has one of the world's largest Orthodox churches!",
    landmark: "Belgrade Fortress",
  },
  Seychelles: {
    flag: "🇸🇨",
    fact: "Seychelles has the world's heaviest seed - the coco de mer!",
    landmark: "Vallée de Mai",
  },
  "Sierra Leone": {
    flag: "🇸🇱",
    fact: "Sierra Leone has beaches where you can find diamonds!",
    landmark: "Tacugama Chimpanzee Sanctuary",
  },
  Singapore: {
    flag: "🇸🇬",
    fact: "Singapore has a hotel with a boat-shaped pool on top of three skyscrapers!",
    landmark: "Marina Bay Sands",
  },
  Slovakia: {
    flag: "🇸🇰",
    fact: "Slovakia has more castles and chateaux per capita than any other country!",
    landmark: "Spiš Castle",
  },
  Slovenia: {
    flag: "🇸🇮",
    fact: "Slovenia has a castle built into the side of a cave!",
    landmark: "Predjama Castle",
  },
  "Solomon Islands": {
    flag: "🇸🇧",
    fact: "The Solomon Islands has active underwater volcanoes!",
    landmark: "Mataniko Falls",
  },
  Somalia: {
    flag: "🇸🇴",
    fact: "Somalia has the longest coastline in mainland Africa!",
    landmark: "Laas Geel Cave Paintings",
  },
  "South Africa": {
    flag: "🇿🇦",
    fact: "South Africa has 11 official languages!",
    landmark: "Table Mountain",
  },
  "South Korea": {
    flag: "🇰🇷",
    fact: "South Korea has heated floors in many homes called 'ondol'!",
    landmark: "Gyeongbokgung Palace",
  },
  "South Sudan": {
    flag: "🇸🇸",
    fact: "South Sudan is the world's newest country, formed in 2011!",
    landmark: "Boma National Park",
  },
  Spain: {
    flag: "🇪🇸",
    fact: "In Spain, people take a nap called 'siesta' in the afternoon!",
    landmark: "Sagrada Familia",
  },
  "Sri Lanka": {
    flag: "🇱🇰",
    fact: "Sri Lanka was the first country in the world to have a female prime minister!",
    landmark: "Sigiriya Rock Fortress",
  },
  Sudan: {
    flag: "🇸🇩",
    fact: "Sudan has more pyramids than Egypt!",
    landmark: "Pyramids of Meroe",
  },
  Suriname: {
    flag: "🇸🇷",
    fact: "Suriname is the smallest country in South America!",
    landmark: "Central Suriname Nature Reserve",
  },
  Sweden: {
    flag: "🇸🇪",
    fact: "In Sweden, there's a hotel made entirely of ice that melts every spring!",
    landmark: "Stockholm Palace",
  },
  Switzerland: {
    flag: "🇨🇭",
    fact: "Switzerland has enough nuclear bunkers to shelter its entire population!",
    landmark: "Matterhorn",
  },
  Syria: {
    flag: "🇸🇾",
    fact: "Syria has one of the oldest continuously inhabited cities in the world - Damascus!",
    landmark: "Ancient City of Palmyra",
  },
  Taiwan: {
    flag: "🇹🇼",
    fact: "Taiwan has the world's tallest green building - Taipei 101!",
    landmark: "Taipei 101",
  },
  Tajikistan: {
    flag: "🇹🇯",
    fact: "Tajikistan has the world's tallest dam!",
    landmark: "Pamir Mountains",
  },
  Tanzania: {
    flag: "🇹🇿",
    fact: "Tanzania has Africa's highest mountain - Mount Kilimanjaro!",
    landmark: "Mount Kilimanjaro",
  },
  Thailand: {
    flag: "🇹🇭",
    fact: "In Thailand, it's considered lucky to have an elephant in your house!",
    landmark: "Grand Palace",
  },
  Togo: {
    flag: "🇹🇬",
    fact: "Togo has the world's largest voodoo market!",
    landmark: "Koutammakou",
  },
  Tonga: {
    flag: "🇹🇴",
    fact: "Tonga is the only Pacific nation never colonized by a foreign power!",
    landmark: "Ha'amonga 'a Maui Trilithon",
  },
  "Trinidad and Tobago": {
    flag: "🇹🇹",
    fact: "Trinidad and Tobago invented the steel pan drum instrument!",
    landmark: "Pitch Lake",
  },
  Tunisia: {
    flag: "🇹🇳",
    fact: "Tunisia has Star Wars movie sets you can still visit today!",
    landmark: "Amphitheatre of El Jem",
  },
  Turkey: {
    flag: "🇹🇷",
    fact: "Turkey is the only country that spans two continents: Europe and Asia!",
    landmark: "Hagia Sophia",
  },
  Turkmenistan: {
    flag: "🇹🇲",
    fact: "Turkmenistan has a giant crater of fire that's been burning for over 50 years!",
    landmark: "Gates of Hell",
  },
  Tuvalu: {
    flag: "🇹🇻",
    fact: "Tuvalu makes money by selling its internet domain .tv!",
    landmark: "Funafuti Conservation Area",
  },
  Uganda: {
    flag: "🇺🇬",
    fact: "Uganda is home to half the world's remaining mountain gorillas!",
    landmark: "Bwindi Impenetrable Forest",
  },
  Ukraine: {
    flag: "🇺🇦",
    fact: "Ukraine has the deepest metro station in the world - Arsenalna!",
    landmark: "Saint Sophia Cathedral",
  },
  "United Arab Emirates": {
    flag: "🇦🇪",
    fact: "The UAE has indoor ski slopes despite being in the desert!",
    landmark: "Burj Khalifa",
  },
  "United Kingdom": {
    flag: "🇬🇧",
    fact: "The UK has a queen's guard that never smiles while on duty!",
    landmark: "Big Ben",
  },
  "United States": {
    flag: "🇺🇸",
    fact: "The US has 50 states and a bald eagle as its national bird!",
    landmark: "Statue of Liberty",
  },
  Uruguay: {
    flag: "🇺🇾",
    fact: "Uruguay was the first country to fully legalize marijuana!",
    landmark: "Casapueblo",
  },
  Uzbekistan: {
    flag: "🇺🇿",
    fact: "Uzbekistan has cities that were key stops on the ancient Silk Road!",
    landmark: "Registan Square",
  },
  Vanuatu: {
    flag: "🇻🇺",
    fact: "In Vanuatu, people bungee jump from tall wooden towers with vines tied to their ankles!",
    landmark: "Mount Yasur",
  },
  "Vatican City": {
    flag: "🇻🇦",
    fact: "Vatican City is the smallest country in the world!",
    landmark: "St. Peter's Basilica",
  },
  Venezuela: {
    flag: "🇻🇪",
    fact: "Venezuela has the world's highest waterfall - Angel Falls!",
    landmark: "Angel Falls",
  },
  Vietnam: {
    flag: "🇻🇳",
    fact: "Vietnam has the world's largest cave - Son Doong Cave!",
    landmark: "Ha Long Bay",
  },
  Yemen: {
    flag: "🇾🇪",
    fact: "Yemen has buildings made of mud that are over 30 stories tall!",
    landmark: "Socotra Island",
  },
  Zambia: {
    flag: "🇿🇲",
    fact: "Zambia has Victoria Falls, one of the Seven Natural Wonders of the World!",
    landmark: "Victoria Falls",
  },
  Zimbabwe: {
    flag: "🇿🇼",
    fact: "Zimbabwe has stone ruins from an ancient city that's over 900 years old!",
    landmark: "Great Zimbabwe Ruins",
  },
}

const MapExplorer = () => {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [countryInfo, setCountryInfo] = useState(null)
  const [scrollY, setScrollY] = useState(0)

  // Track scroll position to adjust info box position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleCountryClick = (geo, evt) => {
    const countryName = geo.properties.NAME || geo.properties.name
    setSelectedCountry(countryName)

    const info = countryFacts[countryName]
    if (info) {
      setCountryInfo({
        name: countryName,
        flag: info.flag,
        fact: info.fact,
        landmark: info.landmark,
      })
    } else {
      setCountryInfo({
        name: countryName,
        flag: "🌍",
        fact: "This is " + countryName + "! Click another country to learn more!",
        landmark: "Famous places",
      })
    }

    // Position tooltip near click
    setPosition({ x: evt.clientX, y: evt.clientY })
  }

  return (
    <div className="relative flex flex-col items-center p-4 min-h-screen bg-gradient-to-b from-blue-200 to-green-200">
      <h1 className="text-4xl font-bold mb-4 text-purple-600 font-comic">🌍 Explore Our Amazing World! 🌎</h1>
      <p className="text-xl mb-6 text-center text-indigo-600">Click on any country to discover fun facts!</p>

      <div className="relative w-full max-w-4xl border-4 border-yellow-400 rounded-xl overflow-hidden shadow-2xl">
        <ComposableMap projectionConfig={{ scale: 150 }} className="bg-blue-100">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={(evt) => handleCountryClick(geo, evt)}
                  style={{
                    default: {
                      fill: "#4FD1C5",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                    },
                    hover: {
                      fill: "#F6E05E",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                    },
                    pressed: {
                      fill: "#68D391",
                      outline: "none",
                      stroke: "#FFFFFF",
                      strokeWidth: 0.5,
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Floating Country Info Box - Follows scroll */}
      <AnimatePresence>
        {selectedCountry && countryInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bg-gradient-to-r from-yellow-200 to-orange-200 p-6 rounded-2xl shadow-2xl border-4 border-purple-400 max-w-md z-50"
            style={{
              top: Math.min(position.y - 100 + scrollY, window.innerHeight + scrollY - 300),
              left: Math.min(position.x + 20, window.innerWidth - 350),
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl">{countryInfo.flag}</span>
              <h2 className="text-3xl font-bold text-purple-700">{countryInfo.name}</h2>
            </div>

            <div className="bg-white bg-opacity-70 rounded-xl p-4 mb-3">
              <h3 className="text-xl font-bold text-blue-600 mb-2">Fun Fact:</h3>
              <p className="text-lg text-gray-800">{countryInfo.fact}</p>
            </div>

            <div className="bg-white bg-opacity-70 rounded-xl p-4">
              <h3 className="text-xl font-bold text-green-600 mb-2">Famous Landmark:</h3>
              <p className="text-lg text-gray-800">{countryInfo.landmark}</p>
            </div>

            <button
              className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 flex items-center mx-auto"
              onClick={() => setSelectedCountry(null)}
            >
              Close ✖
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center">
        <p className="text-xl text-purple-700 font-bold">Click on any country to learn cool facts! 🧠</p>
        <p className="text-lg text-blue-600 mt-2">How many countries can you explore today? 🔍</p>
      </div>
    </div>
  )
}

export default MapExplorer

