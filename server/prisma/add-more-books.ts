import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://lucy:password@localhost:5432/library_dev';
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const EXTRA_BOOKS: Record<string, { title: string; author: string; year: number; pages: number; desc: string }[]> = {
  'Science Fiction': [
    { title: 'The Dispossessed', author: 'Ursula K. Le Guin', year: 1974, pages: 341, desc: 'A physicist tries to bridge two worlds divided by ideology.' },
    { title: 'Hyperion', author: 'Dan Simmons', year: 1989, pages: 482, desc: 'Seven pilgrims share their tales on a journey to the Time Tombs.' },
    { title: 'The Forever War', author: 'Joe Haldeman', year: 1974, pages: 236, desc: 'A soldier fights an interstellar war where time dilation changes everything.' },
    { title: 'Rendezvous with Rama', author: 'Arthur C. Clarke', year: 1973, pages: 256, desc: 'A massive alien spacecraft enters the solar system.' },
    { title: 'The Stars My Destination', author: 'Alfred Bester', year: 1956, pages: 236, desc: 'A castaway seeks revenge across a future solar system.' },
    { title: 'Ringworld', author: 'Larry Niven', year: 1970, pages: 288, desc: 'Explorers discover an artificial ring surrounding a distant star.' },
    { title: 'Gateway', author: 'Frederik Pohl', year: 1977, pages: 313, desc: 'Prospectors use alien ships to explore the galaxy for profit.' },
    { title: 'Altered Carbon', author: 'Richard K. Morgan', year: 2002, pages: 375, desc: 'In a future where consciousness can be transferred, a detective solves a murder.' },
    { title: 'Old Mans War', author: 'John Scalzi', year: 2005, pages: 316, desc: 'Senior citizens are recruited into an interstellar military force.' },
    { title: 'Ancillary Justice', author: 'Ann Leckie', year: 2013, pages: 386, desc: 'A starship AI trapped in a human body seeks revenge.' },
    { title: 'The Three-Body Problem', author: 'Liu Cixin', year: 2008, pages: 400, desc: 'Earth makes contact with an alien civilization facing a chaotic universe.' },
    { title: 'Childhood\'s End', author: 'Arthur C. Clarke', year: 1953, pages: 224, desc: 'Aliens arrive on Earth and usher in a golden age with a hidden purpose.' },
    { title: 'Do Androids Dream of Electric Sheep?', author: 'Philip K. Dick', year: 1968, pages: 210, desc: 'A bounty hunter pursues rogue androids in a post-apocalyptic world.' },
    { title: 'Contact', author: 'Carl Sagan', year: 1985, pages: 432, desc: 'A scientist receives a message from an extraterrestrial intelligence.' },
    { title: 'The Martian Chronicles', author: 'Ray Bradbury', year: 1950, pages: 222, desc: 'Stories of humanity colonizing Mars and its consequences.' },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', year: 1953, pages: 194, desc: 'A fireman in a future where books are banned begins to question his role.' },
    { title: 'Ubik', author: 'Philip K. Dick', year: 1969, pages: 224, desc: 'Reality shifts and warps in this mind-bending science fiction mystery.' },
    { title: 'The Demolished Man', author: 'Alfred Bester', year: 1953, pages: 250, desc: 'A businessman plans murder in a world of telepaths.' },
    { title: 'Flowers for Algernon', author: 'Daniel Keyes', year: 1966, pages: 311, desc: 'A man with low intelligence undergoes an experimental procedure to increase his IQ.' },
    { title: 'A Fire Upon the Deep', author: 'Vernor Vinge', year: 1992, pages: 613, desc: 'An ancient threat is unleashed in the far reaches of the galaxy.' },
    { title: 'Blindsight', author: 'Peter Watts', year: 2006, pages: 384, desc: 'A crew investigates an alien object at the edge of the solar system.' },
    { title: 'Pandoras Star', author: 'Peter F. Hamilton', year: 2004, pages: 768, desc: 'A wormhole network connects hundreds of human worlds until a threat emerges.' },
    { title: 'The Mote in Gods Eye', author: 'Larry Niven', year: 1974, pages: 537, desc: 'Humanity makes first contact with an alien species hiding a dark secret.' },
    { title: 'Permutation City', author: 'Greg Egan', year: 1994, pages: 310, desc: 'Explores consciousness and virtual reality in a world of digital copies.' },
    { title: 'Echopraxia', author: 'Peter Watts', year: 2014, pages: 384, desc: 'A biologist is caught up in a conflict between posthuman factions.' },
    { title: 'Leviathan Wakes', author: 'James S.A. Corey', year: 2011, pages: 561, desc: 'A detective and a ship captain uncover a conspiracy that threatens the solar system.' },
    { title: 'Red Mars', author: 'Kim Stanley Robinson', year: 1993, pages: 572, desc: 'The first colonists on Mars struggle to terraform and govern the red planet.' },
    { title: 'Spin', author: 'Robert Charles Wilson', year: 2005, pages: 364, desc: 'Earth is enclosed in a mysterious barrier that alters the flow of time.' },
    { title: 'The Windup Girl', author: 'Paolo Bacigalupi', year: 2009, pages: 361, desc: 'Biotechnology and politics clash in a future Thailand.' },
    { title: 'Tau Zero', author: 'Poul Anderson', year: 1970, pages: 190, desc: 'A starship accelerates without end, approaching the speed of light.' },
    { title: 'Embassytown', author: 'China Mieville', year: 2011, pages: 345, desc: 'Humans on an alien world must navigate a language that shapes reality.' },
    { title: 'Revelation Space', author: 'Alastair Reynolds', year: 2000, pages: 585, desc: 'A scientist, an assassin, and a crew investigate an ancient alien threat.' },
    { title: 'Accelerando', author: 'Charles Stross', year: 2005, pages: 390, desc: 'Three generations navigate a technological singularity.' },
    { title: 'House of Suns', author: 'Alastair Reynolds', year: 2008, pages: 473, desc: 'Clones of an ancient explorer meet every two hundred thousand years.' },
    { title: 'Light', author: 'M. John Harrison', year: 2002, pages: 320, desc: 'Three storylines converge around a mysterious region of space.' },
    { title: 'Babel-17', author: 'Samuel R. Delany', year: 1966, pages: 192, desc: 'A poet must decode an alien language that reshapes thought.' },
    { title: 'Schismatrix Plus', author: 'Bruce Sterling', year: 1996, pages: 320, desc: 'Humanity splits into factions of mechanists and shapers in space.' },
    { title: 'Glasshouse', author: 'Charles Stross', year: 2006, pages: 335, desc: 'A post-human wakes with no memory inside a simulated society.' },
    { title: 'Diaspora', author: 'Greg Egan', year: 1997, pages: 320, desc: 'Software beings explore the universe after humanity evolves beyond biology.' },
    { title: 'Pushing Ice', author: 'Alastair Reynolds', year: 2005, pages: 458, desc: 'A comet mining crew is pulled across the galaxy by an alien artifact.' },
  ],
  'Fantasy': [
    { title: 'The Blade Itself', author: 'Joe Abercrombie', year: 2006, pages: 515, desc: 'A barbarian, a torturer, and a nobleman are drawn into a war.' },
    { title: 'The Wizard of Earthsea', author: 'Ursula K. Le Guin', year: 1968, pages: 183, desc: 'A young wizard must confront a shadow he accidentally unleashed.' },
    { title: 'Assassins Apprentice', author: 'Robin Hobb', year: 1995, pages: 435, desc: 'A royal bastard is trained as an assassin.' },
    { title: 'The Eye of the World', author: 'Robert Jordan', year: 1990, pages: 782, desc: 'A young man discovers he may be the prophesied hero.' },
    { title: 'Gardens of the Moon', author: 'Steven Erikson', year: 1999, pages: 496, desc: 'Soldiers and gods clash in the first Malazan Book of the Fallen.' },
    { title: 'Elantris', author: 'Brandon Sanderson', year: 2005, pages: 496, desc: 'A prince is transformed by a mysterious curse.' },
    { title: 'The Priory of the Orange Tree', author: 'Samantha Shannon', year: 2019, pages: 848, desc: 'Queens and dragonriders fight to save the world from a rising evil.' },
    { title: 'Jonathan Strange and Mr Norrell', author: 'Susanna Clarke', year: 2004, pages: 782, desc: 'Two magicians revive English magic during the Napoleonic Wars.' },
    { title: 'Piranesi', author: 'Susanna Clarke', year: 2020, pages: 272, desc: 'A man explores an infinite house of halls and statues.' },
    { title: 'The Poppy War', author: 'R.F. Kuang', year: 2018, pages: 527, desc: 'An orphan discovers shamanic powers during wartime.' },
    { title: 'Circe', author: 'Madeline Miller', year: 2018, pages: 393, desc: 'The witch of Greek mythology tells her own story.' },
    { title: 'The Night Circus', author: 'Erin Morgenstern', year: 2011, pages: 387, desc: 'Two magicians compete in an enchanted circus.' },
    { title: 'Uprooted', author: 'Naomi Novik', year: 2015, pages: 435, desc: 'A girl is chosen by a wizard to protect her valley from an evil forest.' },
    { title: 'The Golem and the Jinni', author: 'Helene Wecker', year: 2013, pages: 486, desc: 'A golem and a jinni navigate immigrant life in 1899 New York.' },
    { title: 'Tigana', author: 'Guy Gavriel Kay', year: 1990, pages: 676, desc: 'Rebels fight to restore the memory of a conquered land.' },
    { title: 'The Curse of Chalion', author: 'Lois McMaster Bujold', year: 2001, pages: 442, desc: 'A broken soldier becomes tutor to a princess and faces divine politics.' },
    { title: 'The Fifth Season', author: 'N.K. Jemisin', year: 2015, pages: 468, desc: 'A woman with earth-shaking powers survives a continent-breaking catastrophe.' },
    { title: 'Kings of the Wyld', author: 'Nicholas Eames', year: 2017, pages: 502, desc: 'An aging band of mercenaries reunites for one last adventure.' },
    { title: 'The Bear and the Nightingale', author: 'Katherine Arden', year: 2017, pages: 323, desc: 'A girl in medieval Russia must protect her family from dark spirits.' },
    { title: 'Spinning Silver', author: 'Naomi Novik', year: 2018, pages: 466, desc: 'A moneylender girl attracts the attention of a winter king.' },
    { title: 'Sabriel', author: 'Garth Nix', year: 1995, pages: 310, desc: 'A young woman crosses into a magical realm to rescue her father.' },
    { title: 'The Magicians', author: 'Lev Grossman', year: 2009, pages: 402, desc: 'A brilliant young man discovers a secret magical graduate school.' },
    { title: 'Daughter of the Moon Goddess', author: 'Sue Lynn Tan', year: 2022, pages: 498, desc: 'The daughter of the moon goddess hides her identity in the celestial court.' },
    { title: 'The Rage of Dragons', author: 'Evan Winter', year: 2019, pages: 544, desc: 'A young man seeks revenge in a world of magic and war.' },
    { title: 'The Black Prism', author: 'Brent Weeks', year: 2010, pages: 629, desc: 'A powerful ruler who can split light into magic faces rebellion.' },
    { title: 'Blood Song', author: 'Anthony Ryan', year: 2013, pages: 591, desc: 'A warrior monk rises through the ranks of a military order.' },
    { title: 'The Traitor Baru Cormorant', author: 'Seth Dickinson', year: 2015, pages: 399, desc: 'A young woman infiltrates an empire to destroy it from within.' },
    { title: 'The Grace of Kings', author: 'Ken Liu', year: 2015, pages: 613, desc: 'Two heroes lead a rebellion against a tyrannical empire.' },
    { title: 'Senlin Ascends', author: 'Josiah Bancroft', year: 2013, pages: 389, desc: 'A schoolteacher searches for his wife inside a bizarre tower.' },
    { title: 'Jade City', author: 'Fonda Lee', year: 2017, pages: 498, desc: 'Rival clans fight for control of magical jade in an Asian-inspired city.' },
    { title: 'The Shadow of the Wind', author: 'Carlos Ruiz Zafon', year: 2001, pages: 487, desc: 'A boy discovers a mysterious book and the secrets surrounding its author.' },
    { title: 'Prince of Thorns', author: 'Mark Lawrence', year: 2011, pages: 338, desc: 'A teenage prince leads a band of outlaws on a path of vengeance.' },
    { title: 'The Library at Mount Char', author: 'Scott Hawkins', year: 2015, pages: 400, desc: 'Adopted children of a god-like librarian compete for his power.' },
    { title: 'The Bone Ships', author: 'RJ Barker', year: 2019, pages: 432, desc: 'A disgraced fleet commander sails a ship of the dead.' },
    { title: 'Warbreaker', author: 'Brandon Sanderson', year: 2009, pages: 592, desc: 'Two princesses navigate politics in a kingdom powered by color-based magic.' },
    { title: 'The Hundred Thousand Kingdoms', author: 'N.K. Jemisin', year: 2010, pages: 395, desc: 'A young woman is drawn into the politics of gods imprisoned in a palace.' },
    { title: 'The Sword of Kaigen', author: 'M.L. Wang', year: 2019, pages: 603, desc: 'A warrior mother defends her mountain village with elemental powers.' },
    { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', year: 1968, pages: 183, desc: 'A young mage must face the darkness he unleashed.' },
    { title: 'The Goblin Emperor', author: 'Katherine Addison', year: 2014, pages: 446, desc: 'An unlikely heir must learn to rule an empire of elves and goblins.' },
    { title: 'City of Stairs', author: 'Robert Jackson Bennett', year: 2014, pages: 452, desc: 'A spy investigates a murder in a city where gods once ruled.' },
  ],
};

async function main() {
  const genres = await prisma.book.findMany({ select: { genre: true }, distinct: ['genre'] });
  const allGenres = genres.map(g => g.genre);

  console.log(`Found ${allGenres.length} genres. Adding more books...`);

  let added = 0;
  for (const genre of allGenres) {
    const currentCount = await prisma.book.count({ where: { genre } });
    const needed = 50 - currentCount;
    if (needed <= 0) {
      console.log(`  ${genre}: already ${currentCount} books, skipping`);
      continue;
    }

    const extraBooks = EXTRA_BOOKS[genre];
    if (extraBooks) {
      const toAdd = extraBooks.slice(0, needed);
      for (const b of toAdd) {
        await prisma.book.create({
          data: {
            title: b.title,
            author: b.author,
            genre,
            description: b.desc,
            publishedYear: b.year,
            pageCount: b.pages,
            content: b.desc + '\n\nThis is a sample content excerpt for testing purposes.',
          },
        });
        added++;
      }
      console.log(`  ${genre}: added ${toAdd.length} books (${currentCount} → ${currentCount + toAdd.length})`);
    } else {
      // Generate placeholder books for genres without extra data
      for (let i = 0; i < needed; i++) {
        await prisma.book.create({
          data: {
            title: `${genre} Book ${currentCount + i + 1}`,
            author: `${genre} Author ${i + 1}`,
            genre,
            description: `A fascinating ${genre.toLowerCase()} book, number ${currentCount + i + 1} in the collection.`,
            publishedYear: 2000 + (i % 25),
            pageCount: 150 + (i * 10),
            content: `Welcome to ${genre} Book ${currentCount + i + 1}. This is sample content for testing and browsing purposes.`,
          },
        });
        added++;
      }
      console.log(`  ${genre}: added ${needed} placeholder books (${currentCount} → 50)`);
    }
  }

  const total = await prisma.book.count();
  console.log(`\nDone! Added ${added} books. Total: ${total} books.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
