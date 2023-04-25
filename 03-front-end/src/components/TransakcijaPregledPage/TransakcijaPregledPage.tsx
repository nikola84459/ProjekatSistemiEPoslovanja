import TransakcijaModel, { RacunTransakcija } from "../../../../03-back-end/src/components/transakcija/model";
import TransakcijaService from "../../services/TransakcijaService";
import BasePage, { BasePageProperties } from "../BasePage/BasePage";
import { Table, Container, Alert, Spinner } from "react-bootstrap";
import "./transakcijaPregled.css"
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from "../../Api/EventRegister";
import { Redirect } from 'react-router-dom';
import getLocationAndIp from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import IErrorResponse from "../../../../03-back-end/common/IErrorResponse.interface";
import RacunModel from "../../../../03-back-end/src/components/racun/model";
import NaslovComponent from "../NaslovComponent/NaslovComponent";

class TransakcijaPregledPoroperties extends BasePageProperties{
    match?: {
        params: {
            id: string
        }
    }
}

class TransakcijaPregledState {
    transakcija: TransakcijaModel[] | null;
    isPrazno: boolean;
    tabela: boolean;
    isUlogovan: boolean | null;
    isUcitavanje: boolean;
    
}

export default class TransakcijaPregledPage extends BasePage<TransakcijaPregledPoroperties> {
    state: TransakcijaPregledState;

    constructor(props: any) {
        super(props);

        this.state = {
            transakcija: null,
            isPrazno: false,
            tabela: true,
            isUlogovan: null,
            isUcitavanje: false
        }
    }

    private getRacunId(): number | null {
        const racunId = this.props.match?.params.id;
        return racunId ? +(racunId) : null;
    }

    private async getTransakcijaByRacunId() {
        const racunId = this.getRacunId()
        if(racunId !== null) {
            this.setState({
                isUcitavanje: true
            })
             
            TransakcijaService.getTransakcijaById(racunId)
            .then ((res: any) => {
                this.setState({
                    transakcija: res,
                    isUcitavanje: false,
                    
                    
                })

                if(res === null) {
                    this.setState(
                        {
                            isPrazno: true
                        }
                    )
                } else {
                    this.setState({
                        isPrazno: false
                    })
                }
                           
            })

           
        }    
    }
   
    componentDidMount() {
        isUlogaUlogovana("korisnik")
        .then(res => {
            if(!res) {
                EventRegister.emit("AUTH_EVENT", "force_login");
                this.setState({
                    isUlogovan: false
                })
                return;
            } else {
                this.setState({
                    isUlogovan: true
                })
            }
            this.getTransakcijaByRacunId(); 
        })
        
        addAktivnost(window.location.href, "Korisnik pristupio pregledu transakcija.", "korisnik");
               
    }

    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaKorisnik"} />
        }
        return (
            <Container>
                <NaslovComponent poruka="Pregled transakcija"/>
                
                         <Alert show={this.state.isUcitavanje} className="obavestenje"  key="primary" variant="primary">
                         <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                        />
                       
                        Molimo sačekajte
                </Alert>
               
               
                 
                   <Alert show={this.state.isPrazno} className="obavestenje"  key="warning" variant="warning">
                        Ne postoje podaci o transakcijama.
                    </Alert>
            
                
                    <Table hidden = {this.state.isPrazno} className="transakcije" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Broj transakcije</th>
                                <th>Datum i vreme</th>
                                <th>Svrha</th>
                                <th>Tip</th>
                                <th>Valuta</th>
                                <th>Iznos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.transakcija?.map(tr => (
                                <tr>
                                    <td>{tr.br_transakcije}</td>
                                    <td>{
                                            String(tr.datum_i_vreme).substring(8, 10) + "." + String(tr.datum_i_vreme).substring(5, 7) + "." + "" + String(tr.datum_i_vreme).substring(0, 4) + "." + "  " +
                                            String(tr.datum_i_vreme).substring(11, 13) + ":" + String(tr.datum_i_vreme).substring(14, 16) + ":" + String(tr.datum_i_vreme).substring(17, 19)

                                        }
                                        </td>
                                    <td>
                                        {
                                            tr.svrha !== "" ? (
                                                tr.svrha
                                            ): 
                                                "/"
                                        }
                                    </td>
                                    <td>{tr.racunTransakcija?.tip}</td>
                                    <td>{tr.valuta.sifra.toUpperCase()}</td>
                                    <td>{tr.iznos}</td>
                                </tr>
                            ))    
                        }
                    </tbody>  
             
                </Table>
            
          </Container>
        )
    }
}