const { Client } = require("@notionhq/client");

const SECRET_KEY = process.env.SECRET_KEY;

let client = new Client({auth: SECRET_KEY});

const recordPlan = async (today, plan) => {
    await client.blocks.children.append(
        {
            block_id: "83d5d2a8ce664f29b5bffdae4be796be",
            after: "5b3e6e5c0ce34bbebc67087683e12cc5",
            children: [
                {
                    bulleted_list_item: {
                        rich_text: [
                            {
                                text: {
                                    content: `${today} |->| 我们要：${plan}。`
                                }
                            }
                        ]
                    }
                }
            ]
        }
    )
}

const retrieveRaws = async () => {
    let raws = [];
    let cursor = null;
    do {
        let args = {
            database_id: "6ced42aaeee84f5b9c57ce1ffe4a0e26",
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
    return raws;
};

const main = async () => {
    let raws = await retrieveRaws();

    let todayPlan = raws[Math.floor(Math.random() * raws.length)];

    let today = new Date().toISOString().split('T')[0];
    let plan = todayPlan.properties.Plan.title[0].plain_text;
    await recordPlan(today, plan);
    console.log(`🌈🌈🌈 ${today} plan is: ${plan} 🌈🌈🌈`)
}

main();
