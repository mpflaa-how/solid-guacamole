exports.handler = async (event, context) => {

    const user = context.clientContext?.user;

    // Not logged in
    if (!user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: "Not authenticated" })
        };
    }

    // TEMP profile (we will connect database later)
    const profile = {
        id: user.sub,
        email: user.email,
        approved: true,
        onboarding_complete: false
    };

    return {
        statusCode: 200,
        body: JSON.stringify(profile)
    };
};