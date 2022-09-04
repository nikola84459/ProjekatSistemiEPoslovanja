import * as mysql2 from 'mysql2/promise';
import RacunModel from '../racun/model';
import ValutaModel from './model';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default class ValutaService {
    private db: mysql2.Connection;

    constructor(db: mysql2.Connection) {
        this.db = db;
    }

    public async adaptModel(row: any): Promise<ValutaModel> {
        const item: ValutaModel = new ValutaModel();

        item.valuta_id = +(row?.valuta_id);
        item.naziv = row?.naziv;
        item.sifra = row?.sifra;
        item.srednji_kurs = +(row?.srednji_kurs);
        item. kupovni_kurs = +(row.kupovni_kurs);
        item.prodajni_kurs = +(row.prodajni_kurs);

        return item;
    }

    public async getAll(): Promise<ValutaModel[]> {
        const valuta: ValutaModel[] = [];

        const sql = `SELECT
                        *
                    FROM
                        valuta`
        const [ rows ] = await this.db.execute(sql);
        
        if(Array.isArray(rows)) {
            for(const row of rows) {
                 valuta.push (
                     await this.adaptModel (
                        row
                    )
                 )
             }
         }

         return valuta;
        
    }

    public async getBayId(valutaId: number): Promise<ValutaModel> {
        const sql: string = `SELECT 
                                *
                            FROM	
                                valuta
                            WHERE
                                valuta_id = ?`  
        const [ rows ] = await this.db.execute(sql, [valutaId]);

        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }

        if(!Array.isArray(rows)) {
            return null;
        }

        return await this.adaptModel(rows[0]);
    }

    public async getBySifra(sifra: string) {
        const sql: string = `SELECT 
                                *
                            FROM	
                                valuta
                            WHERE
                                sifra = ?`
        const [ rows ] = await this.db.execute(sql, [sifra]);
        
        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }
        
        return await this.adaptModel(rows[0]);
    }

    // Pošto je u specifikaciji projekta navedeno da je potrebno jednom dnevno preuzimati valutu sa sajta Narodne banke Srbije to je uradjeno na ovaj način s obzirom da Nardna banka
    // ne poseduje API za fizička lica sa kojeg bi bilo ovo moguće preuzeti na lepši način.
     // ne poseduje API za fizička lica sa kojeg bi bilo ovo moguće preuzeti na lepši način.
     public async edit() {
        const url = "https://nbs.rs/kursnaListaModul/srednjiKurs.faces?lang=cir&style=layout.css"
        const instanca = axios.create();

        instanca.get(url)
        .then(response => {
            const html = response.data;
           
            const $ = cheerio.load(html);
                       
            $(".table-bordered > tbody > tr").each(async (index, element) => {
                const sifra: string = $($(element).find("td")[0]).text().toLowerCase()
                const kurs: number = +($($(element).find("td")[4]).text().replace(",", "."));
                
                const valutaSifra = await this.getBySifra(sifra);
                const prodajniKurs: number = kurs + (kurs * 0.005);
                const kupovniKurs: number = kurs + (kurs * 0.01);

                if(valutaSifra !== null) {
                    const sql = `UPDATE
                                    valuta
                                SET
                                    srednji_kurs = ?,
                                    kupovni_kurs = ?,
                                    prodajni_kurs = ?
                                WHERE
                                    sifra = ?`

                    this.db.execute(sql, [kurs, kupovniKurs, prodajniKurs, sifra]);                
                } 
                
            });
              
        })   
    }
}    