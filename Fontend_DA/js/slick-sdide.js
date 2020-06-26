$('.multiple-items').slick({
    infinite: true,
    speed: 500,
    cssEase: 'linear',
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay:true,
    prevArrow: `<button type="button" class="slick-prev"><i class="fa fa-chevron-left" aria-hidden="true"></i></i></button>`,
    nextArrow: `<button type="button" class="slick-next"><i class="fa fa-chevron-right" aria-hidden="true"></i></button>`,
});