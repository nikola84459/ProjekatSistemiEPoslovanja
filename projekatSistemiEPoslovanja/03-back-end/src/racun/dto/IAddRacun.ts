import Ajv from 'ajv';

interface IAddRacun {
    korisnik_id: number;
    tip: string;
    valuta: any;
}

const ajv = new Ajv();

const IAddRacunValidator = ajv.compile({
    type: "object",
    properties: {
        tip: {
            type: "string",
            minLength: 10,
            maxLength: 10
        },

        korisnik_id: {
            type: "integer",
            minLength: 10,
            maxLength: 10
        },

        valuta: {
            type: "array",
            minLength: 1,
            maxLength: 5
        }
    },

    required: [
        "tip",
        "korisnik_id"
    ],

    additionalProperties: false,
});

export {IAddRacun};
export {IAddRacunValidator};

