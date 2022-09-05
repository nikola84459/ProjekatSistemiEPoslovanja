import * as mysql2 from 'mysql2/promise';
import TransakcijaModel, { RacunTransakcija } from './model';
import RacunModel from '../racun/model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import RacunService from '../racun/service';
import ValutaService from '../valuta/service';


export default class TransakcijaService {
    private db: mysql2.Connection;
    private racunId;

    constructor(db: mysql2.Connection) {
        this.db = db;
    }

    protected async adaptModel(row: any): Promise<TransakcijaModel> {
        const item = new TransakcijaModel();

        item.transakcija_id = +(row?.transakcija_id);
        item.br_transakcije = row?.br_transakcije;
        item.iznos = row?.iznos;
        item.datum_i_vreme = new Date(row?.datum_i_vreme);
        item.svrha = row?.svrha;
        //item.racunTransakcija = await this.getByTip(this.racunId);

        return item;        
    }

    public async getById(id: number) {
        const sql = `SELECT 
                        *
                    FROM
                        transakcija
                    WHERE
                        transakcija_id = ?`
        const [ rows ] = await this.db.execute(sql, [id]);    
        
        return await this.adaptModel(rows[0]);
    }

    public async getByRacunId(id: number): Promise<TransakcijaModel[] | null> {
        this.racunId = id;
        const transakcije: TransakcijaModel[] = [];
        const sql = `SELECT 
                        transakcija.transakcija_id,
                        transakcija.br_transakcije,
                        transakcija.iznos,
                        transakcija.datum_i_vreme,
                        transakcija.svrha 
                    FROM 
                        racun_transakcija
    
                    INNER JOIN transakcija ON racun_transakcija.transakcija_id = transakcija.transakcija_id
    
                    WHERE 
                        racun_transakcija.racun_id = ?`
        const [rows] = await this.db.execute(sql, [this.racunId]);

        if(Array.isArray(rows) && rows.length === 0) {
            return null;
        }
                
        if(Array.isArray(rows)) {
            for(const row of rows) {
                 transakcije.push (
                     await this.adaptModel (
                         row
                     )
                 )
             }
         }
         
         return transakcije;

    }

    public async getByTip(id: number): Promise<RacunTransakcija[]> {
        const tip: RacunTransakcija[] = [];
        
        const sql = `SELECT
                       *
                    FROM 
                        racun_transakcija
                    WHERE
                        racun_transakcija.racun_id = ?`
        const [rows] = await this.db.execute(sql, [id]);
       
        if(Array.isArray(rows)) {
            return rows.map(row => {
                return {
                    racun_transakcija_id: +(row?.racun_transakcija_id),
                    transakcija_id: row?.transakcija_id,
                    racun_id: row?.racun_id,
                    tip: row?.tip      
                }    
            });    
        }
    }

    public async add(brTransakcija: string, iznos: number, datumIVreme: string, svrha: string, racunIdPlatioca: number, racunIdPrimaoca: number,
                    tipUplata: string, tipIsplata: string, valuta: number, valuta1: number, novoStanjePlatioca: number, novoStanjePrimaoca: number
        ): Promise<TransakcijaModel | IErrorResponse> {
        return new Promise <TransakcijaModel |IErrorResponse>(reslove => {
            this.db.beginTransaction()
            .then(async () => {
                const racunService: RacunService = new RacunService(this.db);
                                                                                         
                const sql = `INSERT 
                                transakcija
                            SET
                                br_transakcije = ?,
                                iznos = ?,
                                datum_i_vreme = ?,
                                svrha = ?,
                                valuta_id = ?`
                
                this.db.execute(sql, [brTransakcija, iznos, datumIVreme, svrha, valuta])
                .then(async (p: any) => {
                    const transakcijaId = +(p[0]?.insertId)
                    this.racunId = racunIdPlatioca;

                    const obecanja = [];
                                  
                    obecanja.push(
                        this.db.execute(
                            `INSERT
                                racun_transakcija
                            SET
                                racun_transakcija.transakcija_id = ?,
                                racun_transakcija.racun_id = ?,
                                racun_transakcija.tip = ?`,
                            [transakcijaId, racunIdPlatioca, tipIsplata]    
                                
                        )
                    );

                                               
                    obecanja.push(
                        this.db.execute(
                            `INSERT
                                racun_transakcija
                            SET
                                racun_transakcija.transakcija_id = ?,
                                racun_transakcija.racun_id = ?,
                                racun_transakcija.tip = ?`,
                            [transakcijaId, racunIdPrimaoca, tipUplata]    
                                
                        )
                    );
                    
                    
                    if(valuta1 !== null) {
                        obecanja.push(racunService.edit(novoStanjePrimaoca, valuta ,racunIdPrimaoca));
                        obecanja.push(racunService.edit(novoStanjePlatioca, valuta1 ,racunIdPlatioca));
                    } else {
                        obecanja.push(racunService.edit(novoStanjePlatioca, valuta ,racunIdPlatioca));
                        obecanja.push(racunService.edit(novoStanjePrimaoca, valuta ,racunIdPrimaoca));    
                    }                          
                    
                    
                    Promise.all(obecanja)
                    .then(async () => {
                        this.db.commit();

                        reslove(await this.getById(transakcijaId));
                    })
                    .catch(async error => {
                        await this.db.rollback();

                        reslove({
                            errorCode: error?.errno,
                            errorMessage: error?.sqlMessage
                        });
                    })

                    
                })
                .catch(async error => {
                    await this.db.rollback();

                    reslove({
                        errorCode: error?.errno,
                        errorMessage: error?.sqlMessage
                    });

                })
            })
            
        });
    }

    public async addMenjacnica() {

    }

    public async getLastData() {
        const sql = `SELECT
                        *
                    FROM
                        transakcija
                    ORDER BY
                        transakcija_id
                    DESC LIMIT 1`;
        const [ rows ] = await this.db.execute(sql);
        
        return this.adaptModel(rows[0]);
    }
}