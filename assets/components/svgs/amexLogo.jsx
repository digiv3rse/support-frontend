// @flow

import React from 'react';

// American Express credit card logo.
export default function SvgAmexLogo() {

  return (
    <svg
      className="svg-amex-logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 24"
      preserveAspectRatio="xMinYMid"
    >
      <defs>
        <path id="a" d="M36.125 30.18H0V15h36.125z" />
      </defs>
      <g transform="translate(-1 -6)" fill="none" fillRule="evenodd">
        <rect fill="#246EA9" x="1" y="6" width="35.25" height="23.25" rx="2.25" />
        <path d="M36.25 16.5V33H1V0h35.25v16.5" />
        <path d="M1 17.276h1.547l.348-.842h.78l.347.842h3.042v-.642l.27.646h1.578l.27-.654v.65h7.557l-.003-1.38h.146c.103.004.132.014.132.183v1.196h3.908v-.322c.315.172.806.322 1.45.322h1.646l.35-.842h.782l.344.842h3.167v-.798l.482.798h2.536V12H29.17v.625l-.35-.625h-2.58v.625L25.916 12h-3.482c-.583 0-1.098.08-1.51.308V12H18.52v.308c-.266-.233-.624-.308-1.023-.308H8.72l-.594 1.363-.6-1.363H4.758v.625L4.452 12H2.096L1 14.506v2.77zm29.875-.744h-1.28l-1.715-2.837v2.837h-1.84l-.354-.843h-1.882l-.337.842h-1.06c-.443 0-.998-.098-1.31-.417-.32-.323-.484-.757-.484-1.445 0-.562.1-1.075.487-1.477.294-.304.75-.444 1.375-.444h.872v.808h-.853c-.332 0-.52.05-.7.226-.152.16-.26.46-.26.857 0 .41.08.698.253.89.135.148.39.194.628.194h.406l1.276-2.975h1.353l1.53 3.577V12.75h1.382l1.588 2.634V12.75h.925v3.782zm-11.628 0h.923V12.75h-.923v3.782zm-.524-2.76c0 .596-.403.913-.636 1.005.197.078.365.208.443.32.13.185.154.358.154.69v.745h-.913l-.003-.477c0-.224.023-.554-.146-.734-.13-.135-.328-.162-.656-.162h-.973v1.374h-.9V12.75h2.077c.463 0 .804.014 1.098.182.287.167.458.414.458.84zm-4.262 2.76h-3.02V12.75h3.02v.788h-2.114v.68h2.062v.777l-2.062-.002v.757h2.115v.782zm-3.695 0H9.84l-.006-2.96-1.31 2.96h-.793l-1.317-2.966v2.966h-1.84l-.346-.843H2.343l-.35.842H1.01l1.618-3.783h1.346L5.51 16.33V12.75h1.48l1.182 2.568 1.088-2.57h1.505v3.784zM25.378 14.9l-.628-1.506-.62 1.506h1.248zm-7.84-.597c-.122.07-.27.075-.446.075h-1.1v-.84h1.11c.162 0 .327.006.434.068.118.056.19.173.19.333 0 .167-.07.298-.188.363zM3.9 14.9l-.617-1.506-.617 1.506H3.9z" fill="#FFFFFE" />
        <mask id="b" fill="#fff">
          <use xlinkHref="#a" />
        </mask>
        <path d="M22.273 19.998c0 1.05-.793 1.27-1.593 1.27h-1.144v1.268h-1.778l-1.13-1.25-1.17 1.25h-3.63V18.75h3.684l1.128 1.24 1.165-1.24h2.926c.73 0 1.543.2 1.543 1.248zm-7.28 1.746H12.74v-.75h2.01v-.772h-2.01v-.685h2.295l1 1.102-1.042 1.104zm3.63.45l-1.405-1.544 1.405-1.49v3.033zm2.098-1.697h-1.184v-.96h1.195c.332 0 .56.128.56.46 0 .33-.217.5-.57.5zm6.18-1.746h3.06v.787h-2.145v.685h2.09v.772h-2.09v.75l2.145.006v.786H26.9V18.75zm-1.157 2.026c.203.075.37.207.45.32.128.185.15.356.15.69v.75h-.918v-.476c0-.226.02-.562-.148-.738-.133-.138-.337-.17-.672-.17h-.98v1.384h-.918V18.75h2.113c.466 0 .804.02 1.103.183.288.17.47.41.47.84 0 .6-.408.91-.65 1.003zm-.553-.468c-.12.07-.274.077-.45.077h-1.116v-.848h1.132c.16 0 .326.002.434.065.118.063.19.177.19.34 0 .164-.072.293-.19.366zm8.264.232c.183.183.277.414.277.8 0 .818-.516 1.196-1.438 1.196h-1.786v-.813h1.778c.176 0 .297-.022.374-.093.062-.057.108-.14.108-.245 0-.11-.047-.2-.11-.25-.073-.06-.167-.083-.327-.087-.858-.03-1.93.026-1.93-1.17 0-.548.35-1.127 1.31-1.127h1.834v.807h-1.676c-.17 0-.278.008-.37.067-.1.062-.137.155-.137.273 0 .144.087.242.202.284.096.033.197.042.353.045l.496.01c.5.014.837.098 1.044.305zm3.657 1.51c-.224.324-.657.486-1.243.486h-1.77v-.813h1.762c.174 0 .296-.022.37-.093.063-.057.11-.14.11-.245 0-.11-.047-.2-.112-.25-.07-.06-.164-.083-.322-.087-.86-.03-1.933.026-1.933-1.17 0-.548.353-1.127 1.312-1.127h1.826V18h-1.695c-.513 0-.885.12-1.147.308V18h-2.51c-.397 0-.867.098-1.092.308l.002-.308h-4.48v.308c-.357-.252-.957-.308-1.235-.308h-2.95v.308c-.288-.268-.91-.308-1.294-.308h-3.307l-.757.808-.708-.808H11v5.28h4.844l.78-.82.736.82h2.986v-1.242h.295c.394.005.865-.007 1.275-.18v1.42h2.465v-1.375h.117c.153 0 .168.008.168.155v1.22h7.485c.472 0 .966-.12 1.243-.337v.34h2.375c.495 0 .976-.067 1.343-.244v-.986zm0-2.493h-1.67c-.168 0-.28.008-.37.067-.094.062-.134.155-.134.273 0 .144.08.242.202.284.095.033.198.042.352.045l.495.01c.5.014.835.098 1.043.305.032.028.058.064.083.096v-1.08z" fill="#FFFFFE" mask="url(#b)" />
      </g>
    </svg>
  );
}
