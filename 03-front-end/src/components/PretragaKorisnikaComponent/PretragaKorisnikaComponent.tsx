import BasePage from '../BasePage/BasePage';
import KorisnikModel from '../../../../03-back-end/src/components/korisnik/model';
import { Form, Button, Table, Container, Alert, Spinner } from "react-bootstrap"
import "./korisnikPretragaComponent.css"
import KorisnikService from '../../services/KorisnikService';
import { Link, Redirect } from "react-router-dom"
import PodaciKorisnikSluzbenikComponent from '../PodaciKorisnikSluzbenikComponent/PodaciKorisnikSluzbenik';
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from '../../Api/EventRegister';
import getLocationAndIp from '../../Dnevnik/Dnevnik';
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';

class PretragaKorisnikaCoponentState {
    korisnik: KorisnikModel[] | null;
    isPretraga: boolean;
    ime: string | null;
    prezime: string | null;
    brLk: string | null;
    jmbg: string | null;
    poruka: string | null;
    isUlogovan: boolean | null;
    isUcitavanje: boolean
}

export default class PretragaKorisnikaComponent extends BasePage<{}> {
    state: PretragaKorisnikaCoponentState

    constructor(props: any) {
        super(props);

        this.state = {
            korisnik: null,
            isPretraga: false,
            ime: null,
            prezime: null,
            brLk: null,
            jmbg: null,
            poruka: null,
            isUlogovan: null,
            isUcitavanje: false

        }
    } 
   
    
    componentDidMount(): void {
        isUlogaUlogovana("sluzbenik")
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
        }) 
        
        addAktivnost(window.location.href, "Službenik pristupio pretrazi korisnika.", "sluzbenik");
    }

    renderMain(): JSX.Element {
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaSluzbenik"} />
        }
        return (
            <Container>
                <Form>
                    <Table>
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Prezime</th>
                                <th>JMBG</th>
                                <th>Broj lične karte</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" name="ime" placeholder="Unesite ime korisnika" />
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" name="prezime" placeholder="Unesite prezime korisnika" />
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" name="jmbg" placeholder="Unesite jmbg korisnika" />
                                    </Form.Group>
                                </td>
                                <td>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Control onChange={e => {this.uzmiPodatke(e)}} type="text" name="brLk" placeholder="Unesite broj lične karte korisnika" />
                                    </Form.Group>
                                </td>
                                <td>
                                <Button disabled = {this.state.isUcitavanje} className='dugmePretraga' onClick={() => {this.posaljiPodatke()}} variant="primary">
                                <Spinner 
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    hidden = {!this.state.isUcitavanje}
                        />
                        {
                        !this.state.isUcitavanje ? (
                            "Pretraži"
                        ) :
                            "Molimo sačekajte"
                        }
                        </Button>
                                </td>
                            </tr>
                        </tbody>  
                    </Table>
                    {
                        this.state.poruka !== null ? (
                            <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                    ): ""}    

                </Form>
                {
                    this.state.isPretraga ? (
                    <Table striped bordered hover className="korisnikTable">
                        <thead>
                            <tr>
                                <th>Ime</th>
                                <th>Prezime</th>
                                <th>JMBG</th>
                                <th>Broj lične karte</th>
                                <th>Aktivan/neaktivan</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.korisnik?.map(k => (
                                    <tr>
                                        <td>{k.ime}</td>
                                        <td>{k.prezime}</td>
                                        <td>{k.jmbg}</td>
                                        <td>{k.br_licne_karte}</td>
                                        {
                                            k.is_aktivan === 1 ? (
                                        <td id='aktivan'>
                                            Aktivan
                                        </td>
                                       ): 
                                         <td id='neaktivan'>Neaktivan</td>       
                                       }                                       
                                        <td>
                                            <Link to={"/podaciKorisnik"}>
                                                <Button onClick={e => this.saveId(e)} value={k.korisnik_id}  variant="primary">Pregled</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>       
                    </Table>
                ) : ""}        
            </Container>    
        )
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })

        if(e.target.value === "") {
            this.setState({
                [e.target.name]: null
            })
        }
    }

    private posaljiPodatke() {
        this.setState({
            isUcitavanje: true
        })

       if(this.state.ime === null && this.state.prezime === null && this.state.brLk === null && this.state.jmbg === null) { 
            return this.setState({
                isUcitavanje: false,
                poruka: "Niste uneli pojam za pretragu. Molimo Vas unesite pojam za pretragu."
            })       
        }

        if(this.state.ime !== null && this.state.prezime !== null) {
            if(this.state.jmbg !== null && this.state.brLk !== null) {
                return this.setState({
                    poruka: "Ukoliko vršite pretragu po imenu i prezimenu polje JMBG i Broj lične karte moraju biti prazni.",
                    isUcitavanje: false
                })
            }
        } else {
            if(this.state.jmbg === null && this.state.brLk === null) { 
                return this.setState({
                    poruka: "Ukoliko vršite pretragu po imenu i prezimenu i polje ime i polje prezime moraju biti popunjeni.",
                    isUcitavanje: false    
                })
            }
        }

        if(this.state.jmbg !== null) {
            if(this.state.brLk !== null || this.state.ime !== null || this.state.prezime !== null) {
                return this.setState({
                    poruka: "Ukoliko vršite pretragu po JMBG-u ostala polja moraju biti prazna.",
                    isUcitavanje: false
                })    
            }
        }

        if(this.state.brLk !== null) {
            if(this.state.jmbg !== null || this.state.ime !== null || this.state.prezime !== null) {
                return this.setState({
                    poruka: "Ukoliko vršite pretragu po broju lične karte ostala polja moraju biti prazna.",
                    isUcitavanje: false
                })      
            }    
        }


        KorisnikService.searchKorisnik({
            ime: this.state.ime,
            prezime: this.state.prezime,
            brLicneKarte: this.state.brLk,
            jmbg: this.state.jmbg
        })
        .then(res => {
            if(res.success) {
                this.setState({
                    poruka: null,
                    korisnik: res.korisnik,
                    isPretraga: true,
                    isUcitavanje: false    
                })
                addAktivnost(window.location.href, "Službenik izvršio pretragu korisnika.", "sluzbenik");
            } else {
                this.setState({
                    poruka: res.message,
                    isUcitavanje: false
                })
            }
        })
    }

    private saveId(e: any) {
        KorisnikService.setKorisnikSession({
            korisnikId: +(e.target.value)
        })
    }      
    
}