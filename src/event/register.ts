export default function () {
    import('./damage.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/damage  loading failed.');
        });
    import('./FakeInvCloseEvent.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/FakeInvCloseEvent  loading failed.');
        });
    import('./playerItemHeld.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/playerItemHeld  loading failed.');
        });
    import('./playerJoin.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/playerJoin  loading failed.');
        });
    import('./playerQuit.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/playerQuit  loading failed.');
        });
    import('./RegainHealthEvent.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('./event/RegainHealthEvent  loading failed.');
        });

    // fakeinv Close Event
    import('../enhancements/seiko/SeikoFakeInvClose.js')
    .catch((err) => {
        console.warn(err.stack);
        console.error('../improvements/seiko/SeikoFakeInvClose  loading failed.');
    });
    import('../enhancements/strength/StrengthFakeInvClose.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('../enhancements/strength/StrengthFakeInvClose  loading failed.');
        });
    import('../enhancements/forging/ForgingFakeInvClose.js')
        .catch((err) => {
            console.warn(err.stack);
            console.error('../improvements/forging/ForgingFakeInvClose  loading failed.');
        });
}