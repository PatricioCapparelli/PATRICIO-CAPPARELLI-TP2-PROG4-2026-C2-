export function opcionesCookie() {
    const produccion = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: produccion,
        sameSite: produccion ? ('none' as const) : ('lax' as const),
        maxAge: 24 * 60 * 60 * 1000, 
        path: '/',
    };
}

export function opcionesBorrado() {
    const { maxAge, ...resto } = opcionesCookie();
    void maxAge;
    return resto;
}