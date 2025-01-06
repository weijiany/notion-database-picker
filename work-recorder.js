const { Client } = require("@notionhq/client");
const { DateTime } = require("luxon");

const SECRET_KEY = process.env.SECRET_KEY;

let client = new Client({auth: SECRET_KEY});

const DATABASE_ID = "7c22cad0ec4f4940804133bf25369ee7";
const config = {
    startDate: DateTime.fromISO("2024-12-31T00:00:00"),
    loops: [
        {
            name: "Work",
            total: 4,
            work: 3,
        },
        // {
        //     name: "Nightly",
        //     total: 12,
        //     work: 1
        // }
    ],
};


const retrieveMultiSelectFieldName2Id = (propertyName) =>
    client.databases.retrieve({database_id: DATABASE_ID})
        .then(db => Object.assign(
                ...db.properties[propertyName]
                    .multi_select
                    .options
                    .map(({id, name}) => ({[name]: id}))
            )
        );

const typeFieldOf = async (date) => {
    let name2Id = await retrieveMultiSelectFieldName2Id("Type");
    let diffDays = Math.floor(date
        .set({
            hour: 0,
            minute: 0,
            second: 0,
        })
        .diff(config.startDate, "days")
        .get("days"));

    return config.loops
        .filter(loop => (diffDays % loop.total + 1) <= loop.work)
        .map(loop => ({id: name2Id[loop.name], name: loop.name}))
}

const main = async () => {
    let now = DateTime.now();

    let multiSelect = await typeFieldOf(now);
    if (multiSelect.length === 0) {
        console.log(`${now.toISODate()} is rest day.`);
        return;
    }

    console.log(`${now.toISODate()} is ${multiSelect.map(item => item.name).join(" and ")} day.`);

    await client.pages.create({
        parent: {database_id: DATABASE_ID},
        properties: {
            'Date': {
                type: 'date',
                date: {
                    start: now.toISODate()
                }
            },
            "Type": {
                type: 'multi_select',
                multi_select: multiSelect
            }
        }
    })
}

main();

