import { LightningElement } from 'lwc';
import maladie1 from '@salesforce/resourceUrl/maladie';
import habtaton1 from '@salesforce/resourceUrl/habtaton';
import Vie1 from '@salesforce/resourceUrl/vie';

export default class HomeType extends LightningElement {
    services = [
        {
            id: 1,
            imageSrc: maladie1,
            altText: 'Health Insurance',
            title: 'Assurance Maladie',
            description: 'Garantissez la poursuite du versement du salaire à vos collaborateurs absents suite à une maladie',
            link: 'https://talan-9a-dev-ed.develop.preview.salesforce-experience.com/Safesure01/s/viepage?previewAuth=1CAAAAY6jmxBoAAAAAAAAAAAAAAAAAAAAAAAA-EMjXr8scv9dA3dzdlDCJSG5jfE202v51UE98YQdN8G6CeNuKvTlDALytWbQa2QgEZkTMYqWdWcUIsQHxUMv5eHEe4rX22dAvilKMoT20uovA&app=commeditor&language=en_US'
        },
        {
            id: 2,
            imageSrc: habtaton1,
            altText: 'Santé Insurance',
            title: 'Assurance Accident',
            description: 'Nous fournissons une couverture d"assurance pour la Accident.',
          
        },

        {
            id: 3,
            imageSrc: Vie1,
            altText: 'Life Insurance',
            title: 'Assurance Vie',
            description: 'Assurez l"avenir de vos collaborateurs avec notre assurance vie.',
            link: 'https://talan-9a-dev-ed.develop.my.site.com/Safesure01/s/ViePage'
        },
    ];
}
