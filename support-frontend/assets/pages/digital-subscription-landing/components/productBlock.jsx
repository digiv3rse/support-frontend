/* eslint-disable react/no-unused-prop-types */
// @flow
import React, { Component, type Node } from 'react';
import AdFreeSectionC from 'components/adFreeSectionC/adFreeSectionC';
import { trackComponentClick } from 'helpers/tracking/behaviour';
import GridPicture from 'components/gridPicture/gridPicture';
import cx from 'classnames';
import { type CountryGroupId } from 'helpers/internationalisation/countryGroup';
import { ListHeading } from 'components/productPage/productPageList/productPageList';

// styles
import './digitalSubscriptionLanding.scss';

const Plus = () => <div className="product-block__plus">+ Plus</div>;

const arrowSvg = (
  <svg width="18" height="10" xmlns="http://www.w3.org/2000/svg">
    <defs><path d="M16 0l1.427 1.428-7.035 7.036.035.035L9 9.927l-.035-.035-.036.035L7.5 8.5l.036-.035L.5 1.428 1.928 0l7.036 7.036L15.999 0z" id="a" /></defs>
    <use fill="#121212" xlinkHref="#a" fillRule="evenodd" />
  </svg>);

type DropdownPropTypes = {
  children: Node,
  showDropDown: boolean,
  product: string,
}

const Dropdown = ({
  children, showDropDown, product,
}: DropdownPropTypes) => (
  <div
    id={`product-details-${product}`}
    className={cx('product-block__dropdown--hide', { 'product-block__dropdown--show': showDropDown })}
    aria-hidden={showDropDown ? 'false' : 'true'}
  >
    <span className="product-block__ul-handler">
      {children}
    </span>
  </div>
);

type ButtonPropTypes = {
  showDropDown: boolean,
  handleClick: Function,
  product: 'daily' | 'app',
}

const Button = ({
  showDropDown, handleClick, product,
}: ButtonPropTypes) => (
  <button
    aria-controls={`product-details-${product}`}
    aria-expanded={showDropDown ? 'true' : 'false'}
    onClick={handleClick}
    className={cx('product-block__button--hide', { 'product-block__button--show': showDropDown })}
  >
    <span className="product-block__button__text">
      <div className={showDropDown ? 'product-block__arrow--up' : 'product-block__arrow--down'}>{arrowSvg}</div>
      <span className="product-block__button__text--bold">
        {showDropDown ? 'Less detail' : 'More detail'}
      </span>
    </span>
  </button>
);

const dailyImage = (
  <GridPicture
    sources={[
      {
        gridId: 'digitalSubsDailyMob',
        srcSizes: [140, 500],
        imgType: 'png',
        sizes: '90vw',
        media: '(max-width: 739px)',
      },
      {
        gridId: 'digitalSubsDaily',
        srcSizes: [575, 958],
        imgType: 'png',
        sizes: '(min-width: 1300px) 750px, (min-width: 1140px) 700px, (min-width: 980px) 600px, (min-width: 740px) 60vw',
        media: '(min-width: 740px)',
      },
    ]}
    fallback="digitalSubsDaily"
    fallbackSize={500}
    altText=""
    fallbackImgType="png"
  />
);

const appImage = (
  <GridPicture
    sources={[
      {
        gridId: 'digitalSubsAppMob',
        srcSizes: [140, 500],
        imgType: 'png',
        sizes: '90vw',
        media: '(max-width: 739px)',
      },
      {
        gridId: 'digitalSubsApp',
        srcSizes: [950, 1000],
        imgType: 'png',
        sizes: '(min-width: 1300px) 750px, (min-width: 1140px) 700px, (min-width: 980px) 600px, (min-width: 740px) 60vw',
        media: '(min-width: 740px)',
      },
    ]}
    fallback="digitalSubsApp"
    fallbackSize={500}
    altText=""
    fallbackImgType="png"
  />
);

type ProductCardPropTypes = {
  title: string,
  subtitle: Node,
  image: Node,
}

const ProductCard = ({ title, subtitle, image }: ProductCardPropTypes) => (
  <section className="product-block__item">
    <h2 className="product-block__item__title">{title}</h2>
    <p className="product-block__item__subtitle">{subtitle}</p>
    <span className="product-block__item__image">{image}</span>
  </section>
);

type StateTypes = {
  showDropDownDaily: boolean,
  showDropDownApp: boolean,
}


type PropTypes = {
  // eslint-ignore no-unused-prop-types
  countryGroupId: CountryGroupId,
}

class ProductBlock extends Component<PropTypes, StateTypes> {
  constructor(props: PropTypes) {
    super(props);
    this.state = {
      showDropDownDaily: false,
      showDropDownApp: false,
    };
  }

  handleClick = (product: string): void => {
    this.setState({
      [`showDropDown${product}`]: !this.state[`showDropDown${product}`],
    });
    const clickAction = this.state[`showDropDown${product}`] ? 'open' : 'close';
    trackComponentClick(`digital-subscriptions-landing-page--accordion--${product}--${clickAction}`);
  }

  render() {
    const { state, props } = this;
    return (
      <div className="hope-is-power__products">
        <section className="product-block__container hope-is-power--centered">
          <div className="product-block__container__label--top">What&apos;s included?</div>
          <ProductCard
            title={props.countryGroupId === 'AUDCountries' ? 'The UK Guardian Daily' : 'The Guardian Daily'}
            subtitle={<span className="product-block__item__subtitle--short-first">Each day&apos;s edition, in one simple, elegant app</span>}
            image={dailyImage}
          />
          <Dropdown
            showDropDown={state.showDropDownDaily}
            product="daily"
          >
            <ListHeading
              items={[
                {
                  boldText: 'A new way to read',
                  explainer: props.countryGroupId === 'AUDCountries'
                    ? 'The UK newspaper, reimagined for mobile and tablet'
                    : 'The newspaper, reimagined for mobile and tablet',
                },
                { boldText: 'Published daily', explainer: 'Each edition available to read by 6am (GMT), 7 days a week' },
                { boldText: 'Easy to navigate', explainer: 'Read the complete edition, or swipe to the sections you care about' },
              ]}
            />
            <ListHeading
              items={[
                { boldText: 'Multiple devices', explainer: 'Beautifully designed for your mobile or tablet on iOS and Android' },
                { boldText: 'Read offline', explainer: 'Download and read whenever it suits you' },
                { boldText: 'Ad-free', explainer: 'Enjoy our journalism uninterrupted, without adverts' },
              ]}
            />
          </Dropdown>
          <Button
            showDropDown={state.showDropDownDaily}
            handleClick={() => this.handleClick('Daily')}
            product="daily"
          />
          <Plus />
          <ProductCard
            title="Premium access to The Guardian Live app"
            subtitle={<span className="product-block__item__subtitle--short-second">Live news, as it happens</span>}
            image={appImage}
          />
          <Dropdown
            showDropDown={state.showDropDownApp}
            product="app"
          >
            <ListHeading
              items={[
                { boldText: 'Live', explainer: 'Follow a live feed of breaking news and sport, as it happens' },
                { boldText: 'Discover', explainer: 'Explore stories you might have missed, tailored to you' },
                { boldText: 'Enhanced offline reading', explainer: 'Download the news whenever it suits you' },
              ]}
            />
            <ListHeading
              items={[
                { boldText: 'Daily Crossword', explainer: 'Play the daily crossword wherever you are' },
                { boldText: 'Ad-free', explainer: 'Enjoy our journalism uninterrupted, without adverts' },
              ]}
            />
          </Dropdown>
          <Button
            showDropDown={state.showDropDownApp}
            handleClick={() => this.handleClick('App')}
            product="app"
          />
          <Plus />
          <AdFreeSectionC />
        </section>
      </div>
    );

  }
}


export default ProductBlock;
