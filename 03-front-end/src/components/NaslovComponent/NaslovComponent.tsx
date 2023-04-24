import BasePage, { BasePageProperties } from '../BasePage/BasePage';
import "./naslov.css";

class NaslovComponentProperties extends BasePageProperties {
    poruka: string;
}


export default class NaslovComponent extends BasePage<NaslovComponentProperties> {
    
    renderMain(): JSX.Element {
        return (
            <div className="naslov">
                <h3>{this.props.poruka}</h3>
            </div>
        )
    }
}