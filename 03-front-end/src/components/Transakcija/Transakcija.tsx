import RacunModel from "../../../../03-back-end/src/components/racun/model";
import RacunService from "../../services/RacunService";
import BasePage from "../BasePage/BasePage";
import { Form, Button, Container, Alert, Modal, Table, Spinner } from "react-bootstrap"
import "./transakcija.css"
import TransakcijaService from "../../services/TransakcijaService";
import { isUlogaUlogovana } from "../../Api/api";
import EventRegister from "../../Api/EventRegister";
import { Redirect } from "react-router-dom";
import getLocationAndIp from "../../Dnevnik/Dnevnik";
import DnevnikService from '../../services/DnevnikService';
import { addAktivnost } from '../../Dnevnik/Dnevnik';
import NaslovComponent from '../NaslovComponent/NaslovComponent';
import ReactDOM from 'react-dom'


class TransakcijaPageState {
    racun: RacunModel[];
    valutaState: any[];
    racuniState: any[];
    racunId: number;
    valutaId: number ;
    brRacuna: string;
    brRacunaSopstveni: string;
    iznos: number;
    svrhaUplate: string;
    poruka: string;
    uspesno: string;
    isUlogovan: boolean | null;
    potvrda: boolean;
    brPlatiocRacun: string; 
    valutaNaziv: string;
    isTransakcija: boolean;
      
}

export default class TransakcijaPage extends BasePage<{}>{
    state: TransakcijaPageState;
    valuta: any = [];
    valutaZaPrikaz: any = [];
    racuniPrikaz: any = [];
                       
    constructor(props: any) {
        super(props)

        this.state = {
            racun: [],
            valutaState: [],
            racuniState: [],
            racunId: 0,
            valutaId: 0,
            brRacuna: "",
            brRacunaSopstveni: "",
            iznos: 0,
            svrhaUplate: "",
            poruka: "",
            uspesno: "",
            isUlogovan: null,
            potvrda: false,
            brPlatiocRacun: "",
            valutaNaziv: "",
            isTransakcija: false
                                     
        }

    }
    
    private getRacun() {
        RacunService.getRacuniByKorisnik()
        .then(res => {
            this.setState({
                    racun: res,
                                                      
                })

                for(let i = 0; i < res[0].racun_valuta.length; i++) {
                    this.valutaZaPrikaz.push(res[0].racun_valuta[i].valutaa) 
               
                }
               
                this.setState({
                    valutaState: this.valutaZaPrikaz,
                    valutaNaziv: this.valutaZaPrikaz[0].sifra,
                    brPlatiocRacun: res[0].br_racuna,
                    racunId: res[0].racun_id // uzima prvi račun u nizu
                })

                for(let i = 0; i < res.length; i++) {
                    for(let j = 0; j < res[i].racun_valuta.length; j++) {
                        for(let v = 0; v < this.valutaZaPrikaz.length; v++) {
                            if(res[i].racun_valuta[j].valuta_id === this.valutaZaPrikaz[v].valuta_id) {
                                this.racuniPrikaz.push(
                            {
                                racunId: res[i].racun_id,
                                racunBr: res[i].br_racuna   
                            })
                    
                        }
                    }
                }
            }
    
            

                this.setState(
                {
                    racuniState: this.racuniPrikaz
                }
                )              
        })
       
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
            this.getRacun();
            addAktivnost(window.location.href, "Korisnik pristupio stranici za prenos novca.", "korisnik");
        })  
        
        document.title = "Prenos novca"
    }

    componentWillUnmount(): void {
        addAktivnost(window.location.href, "Korisnik zatvorio stranicu za prenos novca.", "korisnik");
    }
    
    private updateValuta(id: any) {
        this.valutaZaPrikaz = [];
        this.racuniPrikaz = [];
        let platiocRacun = ""
        for(let i = 0; i < this.state.racun.length; i++) {
            for(let j = 0; j < this.state.racun[i].racun_valuta.length; j++) {
                if(this.state.racun[i].racun_id === +(id)) {
                    platiocRacun = this.state.racun[i].br_racuna;
                    this.valutaZaPrikaz.push(this.state.racun[i].racun_valuta[j].valutaa)
                }
            }
        }
        this.setState({
            valutaState: this.valutaZaPrikaz,
            racunId: id,
            brPlatiocRacun: platiocRacun
        })
       this.updateRacun(this.valutaZaPrikaz[0].valuta_id);
    }

    private updateRacun(idValuta: any) {
        this.setState({
            racuniState: []
        })
        
        this.racuniPrikaz = [];
        let valutaSifra = "";
        
        for(let i = 0; i < this.state.racun.length; i++) {
            for(let j = 0; j < this.state.racun[i].racun_valuta.length; j++) {
                if(this.state.racun[i].racun_valuta[j].valuta_id === +(idValuta)) {
                    valutaSifra = this.state.racun[i].racun_valuta[j].valutaa.sifra;
                    this.racuniPrikaz.push(
                        {
                            racunId: this.state.racun[i].racun_id,
                            racunBr: this.state.racun[i].br_racuna   
                        }
                    )
                        
                }
            }
        }

        this.setState(
            {
                racuniState: this.racuniPrikaz,
                valutaId: idValuta,
                valutaNaziv: valutaSifra
            }
        )
    }
    
    renderMain(): JSX.Element {
        console.log(this.state.brPlatiocRacun)
        if(this.state.isUlogovan === false) {
            return <Redirect to={"/security/prijavaKorisnik"} />
        }
        return (
            
            <Container className="container">
                <NaslovComponent poruka="Prenos novca"/>
                {
                    this.state.poruka !== "" ? (
                 <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                ): ""}
                {
                    this.state.uspesno !== "" ? (
                
                 <Alert className="alert" key={"success"} variant={"success"}>{this.state.uspesno}</Alert>
                ): ""}
                <Form>
                    <Form.Group  className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Račun plaćanja</Form.Label>   
                        <Form.Select onChange={e => {this.updateValuta(e.target.value)}} aria-label="Default select example">
                           
                        {
                            this.state.racun?.map(ra => (
                            <option value={ra.racun_id}>{ra.br_racuna} - {ra.tip}</option>
                            ))
                        }        
                        </Form.Select>
                    </Form.Group>
                
                {   
                    this.state.valutaState.length === 1 ? (              
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Valuta</Form.Label>   
                            <Form.Select disabled aria-label="Default select example">
                            {
                                this.valutaZaPrikaz.map((vl: any) => (
                                <option value={vl.valuta_id}>{vl.sifra}</option>
                                ))    
                            }
                        </Form.Select>
                    </Form.Group>
                    ): 
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Valuta</Form.Label>   
                            <Form.Select onChange={e => {this.updateRacun(e.target.value)}}  aria-label="Default select example">
                            {
                                this.valutaZaPrikaz.map((vl: any) => (
                                <option value={vl.valuta_id}>{vl.sifra}</option>
                                ))
                            }    
                            </Form.Select>
                        </Form.Group>    
                    }
                     
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>U korist sopstvenog računa</Form.Label>   
                    <Form.Select value={this.state.brRacunaSopstveni} onChange={e => {this.onChangeInput(e)}} name="brRacunaSopstveni" aria-label="Default select example">
                    {
                        this.state.racuniState.length === 0 ? (
                        <option value="">Morate odabrati valutu kao bi se prikazao spisak računa za odabranu valutu</option>
                    ): 
                        <><option>Odaberite račun</option>
                        {
                            this.state.racuniState.map(ra => ( 
                            <option value={ra.racunBr}>{ra.racunBr}</option>  
                            ))
                        }
                    </>    
                                                  
                    }
                    </Form.Select>
                    <Form.Text className="text-muted">Odaberite Vaš račun</Form.Text>
                </Form.Group>
                 
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label >U korist drugog računa</Form.Label>
                    <Form.Control value={this.state.brRacuna} onChange={e => {this.onChangeInput(e)}} type="text" name="brRacuna" placeholder="Unesite broj računa" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Iznos</Form.Label>
                    <Form.Control value={this.state.iznos} onChange={e => {this.onChangeInput(e)}} type="number" step="0.01" name="iznos" placeholder="Unesite željeni iznos" />
                </Form.Group>
        
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Svrha uplate</Form.Label>
                    <Form.Control value={this.state.svrhaUplate} onChange={e => {this.onChangeInput(e)}} type="text" name="svrhaUplate" placeholder="Unesite svrhu uplate" />
                </Form.Group>

                <Button onClick={() => {this.prikazObavestenja()}} variant="primary">
                    Izvrši transakciju
                </Button>
            </Form>
            <Modal show={this.state.potvrda}>
                   <Modal.Header>
                        <Modal.Title>Transakcija</Modal.Title>
                   </Modal.Header>

                   <Modal.Body>
                        Da li sigurno želite da izvršite transakciju sa podacima: 
                        <br />
                        
                        <br />
                        <Table striped bordered hover size="sm">
                            <tr>
                                <th>Broj računa sa kojeg se plaća</th>
                                <td>{this.state.brPlatiocRacun}</td>
                            </tr>

                            <tr>
                                <th>U korist računa</th>
                                {
                                    this.state.brRacunaSopstveni !== "" ? (
                                        <td>{this.state.brRacunaSopstveni}</td>
                                    ): 
                                        <td>{this.state.brRacuna}</td>
                                }
                            </tr>
                            <tr>
                                <th>Valuta</th>
                                <td>{this.state.valutaNaziv.toLocaleUpperCase()}</td>
                            </tr> 
                            <tr>
                                <th>Svrha uplate</th>
                                <td>{this.state.svrhaUplate}</td>
                            </tr>   
                            <tr>
                                <th>Iznos</th>
                                <td>{this.state.iznos} <b>{this.state.valutaNaziv.toLocaleUpperCase()}</b></td>
                            </tr>
                        </Table>
                   </Modal.Body>
                    <Modal.Footer>
                        <Button disabled = {this.state.isTransakcija}  variant='primary' value="true" onClick={e => {this.posaljiPodatke(e)}}>
                        <Spinner 
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            hidden = {!this.state.isTransakcija}
                        />
                        {
                        !this.state.isTransakcija ? (
                            "Potvrdi"
                        ) :
                            "Molimo sačekajte"
                        }
                        </Button>
                        <Button disabled = {this.state.isTransakcija} variant='danger' value="false" onClick={e => {this.posaljiPodatke(e)}}>Odustani</Button>
                    </Modal.Footer>

            </Modal>            

        </Container>  
        )
    }

    private onChangeInput(e: any) {
        const value = e.target.value
        this.setState({
               [e.target.name]: value
           
        })
    }

    private prikazObavestenja() {
        console.log(this.state.valutaId);
        const valutaBoolean: boolean = this.state.valutaNaziv === "rsd" ? true : false;
        if((this.state.brRacuna !== "" || this.state.brRacunaSopstveni)&& (this.state.valutaId !== 0 || valutaBoolean) && this.state.iznos !== 0 && this.state.svrhaUplate !== "") {
            this.setState({
                potvrda: true,
                poruka: ""
            })
        } else {
            this.setState({
                poruka: "Niste popunili neophodna polja. Molimo pupunite sva polja.",
            })    
        }

    }

    private posaljiPodatke(e: any) {
        this.setState({
            isTransakcija: true
        })
        if(e.target.value === "true") {
            let brRacuna = "";

            if(this.state.brRacunaSopstveni === "") {
                brRacuna = this.state.brRacuna;
            } else {
                brRacuna = this.state.brRacunaSopstveni;
            }

            if(this.state.brRacuna !== null && this.state.valutaId !== null && this.state.iznos !== null && this.state.svrhaUplate !== null) {
                TransakcijaService.addTransakcija(
                    {
                        racun_id: +(this.state.racunId),
                        valuta_id: +(this.state.valutaId),
                        brRacuna: brRacuna,
                        iznos: +(this.state.iznos),
                        svrha: this.state.svrhaUplate
                    }
                )
                .then(res => {
                    if(!res.success) {
                        this.setState({
                            potvrda: false,
                            poruka: res.message,
                            isTransakcija: false
                        })
                    } else {
                        this.setState({
                            potvrda: false,
                            poruka: "",
                            uspesno: "Transakcija je uspešno izvršena, dobićete E-mail poruku sa detaljima.",
                            isTransakcija: false
                        })
               
                        addAktivnost(window.location.href, "Korisnik izvršio transakciju.", "korisnik");
                    }
                })
            } else {
                this.setState({
                    poruka: "Niste popunili neophodna polja. Molimo pupunite sva polja.",
                    isTransakcija: false
                })
            }    

        } else {
            this.setState({
                potvrda: false
            })
        }
    }
}