# Highscore api

Een simpele api om je high score te kunnen tracken!

## installeren

Clone de repo met `git clone git@github.com:Bloepcode/highscore_api.git`

Maak een `.env` bestand aan.

Zet de database url en de poort erin, voorbeeld:

```
PORT=8000

DATABASE_URL="mysql://di_api:123456789@localhost:3306/di_api?schema=public"
```

Installeer de dependencies met `npm i`

Init de database met: `npx prisma migrate deploy`

Start de server met `npm start`

## Todo

- logging
