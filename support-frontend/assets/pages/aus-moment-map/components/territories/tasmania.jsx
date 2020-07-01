// @flow
import React from 'react';
import { MapGroup } from 'pages/aus-moment-map/components/mapGroup';

export const Tasmania = () => {
  const name = 'Tasmania';
  const labelContrast = false;
  const labelPath = 'M419.037 621V620.66L420.517 620.36V606.96H419.377L416.577 611.58H416.237L416.417 606.58H428.817L428.977 611.58H428.637L425.917 606.96H424.737V620.36L426.217 620.66V621H419.037ZM432.805 615.02L435.205 614.56V613.1C435.205 611.993 435.072 611.227 434.805 610.8C434.552 610.373 434.119 610.16 433.505 610.16C433.439 610.16 433.372 610.167 433.305 610.18C433.239 610.18 433.172 610.187 433.105 610.2L430.405 613.86H430.065L430.145 610.46C430.665 610.3 431.259 610.147 431.925 610C432.592 609.853 433.352 609.78 434.205 609.78C435.672 609.78 436.819 610.02 437.645 610.5C438.472 610.98 438.885 611.84 438.885 613.08V620.2L439.945 620.48V620.76C439.732 620.893 439.425 621.007 439.025 621.1C438.639 621.207 438.219 621.26 437.765 621.26C437.045 621.26 436.492 621.147 436.105 620.92C435.719 620.693 435.445 620.38 435.285 619.98H435.185C434.879 620.393 434.492 620.72 434.025 620.96C433.559 621.187 432.985 621.3 432.305 621.3C431.425 621.3 430.712 621.04 430.165 620.52C429.619 619.987 429.345 619.247 429.345 618.3C429.345 617.38 429.632 616.66 430.205 616.14C430.779 615.607 431.645 615.233 432.805 615.02ZM434.285 619.86C434.512 619.86 434.699 619.827 434.845 619.76C434.992 619.693 435.112 619.6 435.205 619.48V615.08L434.465 615.14C433.892 615.193 433.485 615.42 433.245 615.82C433.005 616.207 432.885 616.807 432.885 617.62C432.885 618.5 433.012 619.093 433.265 619.4C433.532 619.707 433.872 619.86 434.285 619.86ZM445.878 613.82C446.905 614.3 447.685 614.807 448.218 615.34C448.752 615.873 449.018 616.64 449.018 617.64C449.018 618.76 448.632 619.647 447.858 620.3C447.085 620.94 445.972 621.26 444.518 621.26C443.865 621.26 443.212 621.213 442.558 621.12C441.905 621.04 441.312 620.9 440.778 620.7L440.658 617.46H440.998L443.858 620.8C443.952 620.827 444.052 620.853 444.158 620.88C444.265 620.893 444.365 620.9 444.458 620.9C445.072 620.9 445.518 620.747 445.798 620.44C446.092 620.133 446.238 619.727 446.238 619.22C446.238 618.767 446.105 618.42 445.838 618.18C445.572 617.94 445.125 617.673 444.498 617.38L443.838 617.08C442.838 616.613 442.058 616.1 441.498 615.54C440.952 614.98 440.678 614.24 440.678 613.32C440.678 612.2 441.052 611.327 441.798 610.7C442.545 610.073 443.585 609.76 444.918 609.76C445.465 609.76 446.025 609.787 446.598 609.84C447.172 609.893 447.685 609.987 448.138 610.12L448.238 613.14H447.898L445.718 610.22C445.598 610.18 445.478 610.153 445.358 610.14C445.238 610.113 445.125 610.1 445.018 610.1C444.485 610.1 444.092 610.24 443.838 610.52C443.585 610.8 443.458 611.167 443.458 611.62C443.458 612.113 443.592 612.48 443.858 612.72C444.125 612.96 444.592 613.233 445.258 613.54L445.878 613.82ZM449.756 620.66L450.896 620.36V611.3L449.696 610.82V610.48L454.036 609.84L454.476 609.88V611.32H454.596C455.062 610.84 455.569 610.467 456.116 610.2C456.662 609.92 457.289 609.78 457.996 609.78C458.622 609.78 459.136 609.9 459.536 610.14C459.936 610.367 460.242 610.767 460.456 611.34H460.536C461.029 610.847 461.556 610.467 462.116 610.2C462.689 609.92 463.329 609.78 464.036 609.78C464.929 609.78 465.616 610.02 466.096 610.5C466.576 610.967 466.816 611.7 466.816 612.7V620.36L467.976 620.66V621H462.336V620.66L463.236 620.36V612.76C463.236 612.267 463.122 611.913 462.896 611.7C462.669 611.473 462.329 611.36 461.876 611.36C461.662 611.36 461.442 611.393 461.216 611.46C461.002 611.527 460.809 611.607 460.636 611.7V620.36L461.536 620.66V621H456.216V620.66L457.136 620.36V612.76C457.136 612.267 457.029 611.913 456.816 611.7C456.602 611.473 456.262 611.36 455.796 611.36C455.542 611.36 455.309 611.4 455.096 611.48C454.896 611.547 454.709 611.627 454.536 611.72V620.36L455.416 620.66V621H449.756V620.66ZM471.946 615.02L474.346 614.56V613.1C474.346 611.993 474.213 611.227 473.946 610.8C473.693 610.373 473.259 610.16 472.646 610.16C472.579 610.16 472.513 610.167 472.446 610.18C472.379 610.18 472.313 610.187 472.246 610.2L469.546 613.86H469.206L469.286 610.46C469.806 610.3 470.399 610.147 471.066 610C471.733 609.853 472.493 609.78 473.346 609.78C474.813 609.78 475.959 610.02 476.786 610.5C477.613 610.98 478.026 611.84 478.026 613.08V620.2L479.086 620.48V620.76C478.873 620.893 478.566 621.007 478.166 621.1C477.779 621.207 477.359 621.26 476.906 621.26C476.186 621.26 475.633 621.147 475.246 620.92C474.859 620.693 474.586 620.38 474.426 619.98H474.326C474.019 620.393 473.633 620.72 473.166 620.96C472.699 621.187 472.126 621.3 471.446 621.3C470.566 621.3 469.853 621.04 469.306 620.52C468.759 619.987 468.486 619.247 468.486 618.3C468.486 617.38 468.773 616.66 469.346 616.14C469.919 615.607 470.786 615.233 471.946 615.02ZM473.426 619.86C473.653 619.86 473.839 619.827 473.986 619.76C474.133 619.693 474.253 619.6 474.346 619.48V615.08L473.606 615.14C473.033 615.193 472.626 615.42 472.386 615.82C472.146 616.207 472.026 616.807 472.026 617.62C472.026 618.5 472.153 619.093 472.406 619.4C472.673 619.707 473.013 619.86 473.426 619.86ZM479.619 620.66L480.759 620.34V611.3L479.559 610.82V610.48L483.919 609.84L484.359 609.88V611.28H484.479C484.945 610.8 485.512 610.433 486.179 610.18C486.845 609.913 487.519 609.78 488.199 609.78C489.145 609.78 489.839 610.013 490.279 610.48C490.719 610.947 490.939 611.68 490.939 612.68V620.34L492.079 620.66V621H486.279V620.66L487.299 620.4V612.88C487.299 612.347 487.179 611.953 486.939 611.7C486.699 611.447 486.345 611.32 485.879 611.32C485.585 611.32 485.319 611.353 485.079 611.42C484.852 611.487 484.632 611.573 484.419 611.68V620.4L485.419 620.66V621H479.619V620.66ZM495.507 605.36C496.027 605.36 496.48 605.54 496.867 605.9C497.254 606.26 497.447 606.707 497.447 607.24C497.447 607.773 497.254 608.22 496.867 608.58C496.48 608.927 496.027 609.1 495.507 609.1C494.974 609.1 494.52 608.927 494.147 608.58C493.774 608.22 493.587 607.773 493.587 607.24C493.587 606.707 493.774 606.26 494.147 605.9C494.52 605.54 494.974 605.36 495.507 605.36ZM492.547 610.48L496.927 609.84L497.427 609.88V620.34L498.547 620.66V621H492.627V620.66L493.767 620.34V611.3L492.547 610.82V610.48ZM502.61 615.02L505.01 614.56V613.1C505.01 611.993 504.877 611.227 504.61 610.8C504.357 610.373 503.923 610.16 503.31 610.16C503.243 610.16 503.177 610.167 503.11 610.18C503.043 610.18 502.977 610.187 502.91 610.2L500.21 613.86H499.87L499.95 610.46C500.47 610.3 501.063 610.147 501.73 610C502.397 609.853 503.157 609.78 504.01 609.78C505.477 609.78 506.623 610.02 507.45 610.5C508.277 610.98 508.69 611.84 508.69 613.08V620.2L509.75 620.48V620.76C509.537 620.893 509.23 621.007 508.83 621.1C508.443 621.207 508.023 621.26 507.57 621.26C506.85 621.26 506.297 621.147 505.91 620.92C505.523 620.693 505.25 620.38 505.09 619.98H504.99C504.683 620.393 504.297 620.72 503.83 620.96C503.363 621.187 502.79 621.3 502.11 621.3C501.23 621.3 500.517 621.04 499.97 620.52C499.423 619.987 499.15 619.247 499.15 618.3C499.15 617.38 499.437 616.66 500.01 616.14C500.583 615.607 501.45 615.233 502.61 615.02ZM504.09 619.86C504.317 619.86 504.503 619.827 504.65 619.76C504.797 619.693 504.917 619.6 505.01 619.48V615.08L504.27 615.14C503.697 615.193 503.29 615.42 503.05 615.82C502.81 616.207 502.69 616.807 502.69 617.62C502.69 618.5 502.817 619.093 503.07 619.4C503.337 619.707 503.677 619.86 504.09 619.86Z';
  const mapPaths = [
    'M571.6 599.1L570.1 596.1L566.8 593.7L564.4 596.2L561.1 595L559.1 597.3L557.7 597.6L556.1 596.2L554.1 597.3L552.2 596.5L547.5 597.6L544.9 599.1L539.2 598.2L536.3 596.2L534.3 595.4L533.1 594.1L530.8 592.8L530 591.7L527.6 591.2L526.5 590.3L524.6 590.4L522.7 588.9L519.1 587.5L518.3 590.4L516.7 591.8L517.3 594.4L517.2 597.5L518.2 599.7L518.3 601.5L519.5 604.4L520 607L523.3 611.4L524 614L523.7 616.1L525.2 617.1L527.6 620.3L527.1 621.1L524.3 618.7L522.9 618.1L523.7 623.3L524.5 625L525.8 631.2H527.1L528.3 632.9L529.9 637.3L532 636.5L531.8 639.1L532.5 641L537.3 642.8L540.2 642.9L541.7 645L543.3 644.8L546.7 641.8L548 639.1L550.2 639.5L550.9 636.4L552.3 635.5L552.8 632.3L554.8 633.1L556.3 631.3L557 633L559.5 633.4L562.1 629.6L561.9 628.3L562.9 626.9L563 624.7L563.9 621.7L565 619.5L568.3 618.4L569.1 616.3L568.6 615L569.8 610.8L569.5 607.5L570.8 604.3L570.1 602.9L570.8 599.8L571.6 599.1Z',
    'M571 586.9L569.3 586.4L568.3 587.7L568.6 588.4L573 589.7L574.8 588.8L573.2 586L571 586.9Z',
    'M568.1 581.299L568.9 582.499L569.2 584.599L573.4 584.399L573 579.799L571.3 578.599L568.9 574.699L565.5 577.099L567.1 577.699L568.1 581.299Z',
    'M549.1 642.7L550.1 642.9L551 643.3L552.1 641.3L550.3 640.1L549.1 642.7Z',
    'M560.9 632.699L557.9 637.099L558.2 639.299L561.4 638.599L560.8 635.899L562.1 634.199L560.9 632.699Z',
    'M507.5 567.601L507 571.201L507.5 572.501L507.2 574.701L508 575.601L510.7 574.001L511.5 567.201L509.3 565.301L507.5 567.601Z',
  ];

  return (
    <MapGroup
      name={name}
      labelContrast={labelContrast}
      labelPath={labelPath}
      mapPaths={mapPaths}
    />
  );
};
