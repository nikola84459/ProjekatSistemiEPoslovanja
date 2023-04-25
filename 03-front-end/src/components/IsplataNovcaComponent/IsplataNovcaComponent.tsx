import { Container, Form, Button, Alert, Modal, Table, Spinner } from 'react-bootstrap';
import RacunModel from '../../../../03-back-end/src/components/racun/model';
import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import NaslovComponent from '../NaslovComponent/NaslovComponent';
import RacunService from '../../services/RacunService';
import TransakcijaService from '../../services/TransakcijaService';
import ReactToPrint from 'react-to-print';
import PriznanicaComponent from './PriznanicaComponent';
import { Redirect } from 'react-router-dom';

class IsplataNovcaProperties extends BasePageProperties {
    match?: {
        params: {
            id: string
        }
    }
}

class IsplataNovcaComponentState {
    racun: RacunModel | null;
    valutaId: number | null;
    iznos: number | null;
    poruka: string;
    uspesno: boolean;
    potvrda: boolean;
    valuta: string;
    zavrsi: boolean;
    isTransakcija: boolean;
}

export default class IsplataNovcaComponent extends BasePage<IsplataNovcaProperties> {
    state: IsplataNovcaComponentState;
    componentRef: any;

    constructor(props: any) {
        super(props);

        this.state = {
            racun: null,
            valutaId: null,
            iznos: null,
            poruka: "",
            uspesno: false,
            potvrda: false,
            valuta: "",
            zavrsi: false,
            isTransakcija: false
        }
    }

    
    private getRacunId(): number | null {
        const racunId = this.props.match?.params.id;
        return racunId ? +(racunId) : null;
    }
    
    private getRacun() {
        const id = this.getRacunId();
        if(id !== null) {
            RacunService.getById(id)
            .then(res => {
                this.setState({
                    racun: res
                })
            })
        }
    }

    componentDidMount(): void {
        this.getRacun();
    }
    
    renderMain(): JSX.Element {
        if(this.state.zavrsi) {
            return <Redirect to="/podaciKorisnik" /> 
        }

        return (
            <Container>
                <NaslovComponent poruka="Isplata novca" />
                {
                    this.state.poruka !== "" ? (
                        <Alert className="alert" key={"danger"} variant={"danger"}>{this.state.poruka}</Alert>
                    ): ""
                }
               
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Račun sa koga se isplaćuje novac</Form.Label>
                        <Form.Control disabled onChange={e => { this.uzmiPodatke(e); } } name="racunId" value={this.state.racun?.br_racuna}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Valuta</Form.Label>
                        {
                            this.state.racun?.tip === "dinarski" ? (
                        <Form.Select disabled name='valutaId'>
                            <option>rsd</option>        
                    </Form.Select>
                    ): 
                    <Form.Select onChange={e => { this.uzmiPodatke(e); }} name='valutaId'>
                        <option>Odaberite valutu</option>
                        {
                            this.state.racun?.racun_valuta.map(v => (
                                <option value={v.valuta_id}>{v.valutaa.sifra}</option>
                            ))
                        }
                    </Form.Select>
                    }
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Iznos</Form.Label>
                    <Form.Control onChange={e => { this.uzmiPodatke(e); } } type="number" name="iznos" />
                </Form.Group>
            </Form>
            <Button onClick={() => this.prikazObavestenja()} variant="primary">
                    izvrši isplatu novca
                </Button>

                <Modal show={this.state.potvrda}>
                   <Modal.Header>
                        <Modal.Title>Transakcija</Modal.Title>
                   </Modal.Header>

                   <Modal.Body>
                        Da li sigurno želite da izvršite isplatu novca sa sledećim podacima: 
                        <br />
                        
                        <br />
                        <Table striped bordered hover size="sm">
                            <tr>
                                <th>Broj računa isplate</th>
                                <td>{this.state.racun?.br_racuna}</td>
                            </tr>

                            <tr>
                                <th>Valuta</th>
                                <td>{this.state.valuta}</td>
                            </tr> 
                              
                            <tr>
                                <th>Iznos</th>
                                <td>{this.state.iznos} <b>{this.state.valuta.toUpperCase()}</b></td>
                            </tr>
                        </Table>
                   </Modal.Body>
                    <Modal.Footer>
                        <Button disabled = {this.state.isTransakcija} variant='primary' value="true" onClick={e => {this.posaljiPodatke(e)}}>
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

            <Modal show={this.state.uspesno}>
                   <Modal.Header>
                        <Modal.Title>USPEŠNO STE ISPLATILI NOVAC SA RAČUNA KORISNIKA</Modal.Title>
                   </Modal.Header>

                   <Modal.Body>
                       Odštampajte priznanicu

                       <ReactToPrint 
                            trigger={() => <Button variant="link">Odštampaj priznanicu</Button>}
                            content={() => this.componentRef}
                        />
                        <div hidden>
                            <PriznanicaComponent brRacuna={this.state.racun?.br_racuna!} jmbg={this.state.racun?.korisnik.jmbg!} ime={this.state.racun?.korisnik.ime!} 
                                                 prezime={this.state.racun?.korisnik.prezime!} brLk={this.state.racun?.korisnik.br_licne_karte!} iznos={this.state.iznos!}
                                                 valuta={this.state.valuta}
                                                 ref={el => (this.componentRef = el)}
                            />
                        </div>                      
                   </Modal.Body>
                    <Modal.Footer>
                        <Button variant='primary' onClick={() => this.zavrsiIsplatu()}>Završi</Button>
                    </Modal.Footer>

            </Modal>           
            </Container>
        )
    }

    private uzmiPodatke(e: any) {
        this.setState({
            [e.target.name]: e.target.value
        })

    }

    private prikazObavestenja() {
        let valutaNaziv: string = "";
        
        if(this.state.valutaId !== null) {
            this.state.racun?.racun_valuta.map(rv => {
                if(rv.valuta_id === +(this.state.valutaId!)) {
                    valutaNaziv = rv.valutaa.sifra;
                }
            })
            
        } else {
            valutaNaziv = "RSD";
        }

        this.setState({
            valuta: valutaNaziv,
            potvrda: true
        })
    }

    private posaljiPodatke(e: any) {
        this.setState({
            isTransakcija: true
        })

        if(e.target.value === "true") {
            const racunId = this.getRacunId();
            if(racunId !== null && this.state.iznos !== null) {
                if(this.state.valutaId !== null) {
                    TransakcijaService.isplataNovca({
                        racun_id: racunId,
                        valuta_id: +(this.state.valutaId),
                        iznos: +(this.state.iznos)
                    })
                    .then(res => {
                        if(!res.success) {
                            this.setState({
                                poruka: res.message,
                                potvrda: false,
                                isTransakcija: false
                            })
                        } else {
                            this.setState({
                                uspesno: true,
                                potvrda: false,
                                isTransakcija: false
                            })
                        }
                    })
                } else {
                    TransakcijaService.isplataNovca({
                        racun_id: racunId,
                        iznos: +(this.state.iznos)
                    })
                    .then(res => {
                        if(!res.success) {
                            this.setState({
                                poruka: res.message,
                                isTransakcija: false
                            })
                        } else {
                            this.setState({
                                uspesno: true,
                                potvrda: false,
                                isTransakcija: false
                            })
                        }    
                    })     
                }
            } else {
                this.setState({
                    poruka: "Došlo je do greške. Morate popuniti sva polja."
                })
            }
        } else {
            this.setState({
                potvrda: false,
                isTransakcija: false
            })
        }
    }

    
    private zavrsiIsplatu() {
        this.setState({
            uspesno: false,
            zavrsi: true
        })
    }
}