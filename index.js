const { Client } = require("@notionhq/client");

const SECRET_KEY = process.env.SECRET_KEY;
const DATABASE_ID = process.env.DATABASE_ID;

let client = new Client({auth: SECRET_KEY});

const main = async () => {
    let raws = [];
    let cursor = null;
    do {
        let args = {
            database_id: DATABASE_ID,
            page_size: 50,
            filter: {
                and: [
                    {
                        property: "Done",
                        checkbox: {
                            equals: false
                        },
                    },
                    {
                        property: "Plan",
                        title: {
                            is_not_empty: true
                        },
                    }
                ]
            }
        };
        if (cursor != null) {
            args.start_cursor = cursor;
        }
        let db = await client.databases.query(args);
        cursor = db.next_cursor;
        raws.push(...db.results);
    } while (cursor != null)

    let randomIndex = Math.floor(Math.random() * raws.length);
    let todayPlan = raws[randomIndex];

    await client.pages.update({
        page_id: todayPlan.id,
        properties: {
            Done: {checkbox: true},
            "Pick Date": {date: {start: new Date().toISOString().split('T')[0]}}
        }
    });

    console.log(`🌈🌈🌈 today plan is: ${todayPlan.properties.Plan.title[0].plain_text} 🌈🌈🌈`)
}

main();
