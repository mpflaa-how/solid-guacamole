const pool = require("../lib/db");

exports.handler = async (event, context) => {

    const user = context.clientContext?.user;

    if (!user) {
        return { statusCode: 401 };
    }

    const data = JSON.parse(event.body);

    await pool.query(
        `
    insert into profiles
    (id, email, name, alias, statement, focus, onboarding_complete)
    values ($1,$2,$3,$4,$5,$6,true)
    on conflict (id)
    do update set
      name = excluded.name,
      alias = excluded.alias,
      statement = excluded.statement,
      focus = excluded.focus,
      onboarding_complete = true;
    `,
        [
            user.sub,
            user.email,
            data.name,
            data.alias,
            data.statement,
            data.focus
        ]
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
    };
};