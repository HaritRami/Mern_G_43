export const data = {
  banner: [
    {
      img: "https://gepard.io/uploads/product-images-for-ecommerce-websites.jpg",
    },
    {
      img: "https://graphicdesigneye.com/images/studio-shot-product-images.jpg",
    },
    {
      img: "https://www.intellectoutsource.com/blog/images/importance-of-product-images-in-ecommerce-business-stores.jpg",
    },
    {
      img: "https://fathershops.com/wp-content/uploads/2025/06/types-of-ecommerce-photography.png",
    },
    {
      img: "https://i.etsystatic.com/60820252/r/il/2fc1f4/7222903767/il_fullxfull.7222903767_7u49.jpg",
    }
  ],
  iconProducts: [
    {
      to: "/products",
      img: "IconLaptop",
      title: "Men's Clothing",
      text: " Upto 20% off",
      tips: "Sony, Dell, Lenovo",
      cssClass: "text-primary",
    },
    {
      to: "/products",
      img: "IconHeadset",
      title: "Women's Clothing",
      text: " Upto 50% off",
      tips: "Sony, Dell, Lenovo",
      cssClass: "text-secondary",
    },
    {
      to: "/products",
      img: "IconPhone",
      title: "Smartwatch",
      text: " Upto 20% off",
      tips: "Sony, Dell, Lenovo",
      cssClass: "text-danger",
    },
    {
      to: "/products",
      img: "IconTv",
      title: "Footwear",
      text: " Upto 25% off",
      tips: "Sony, Dell, Lenovo",
      cssClass: "text-warning",
    },
  ],
  products: [
    {
      id: 1,
      sku: "FAS-01",
      link: "/products",
      name: "Great product name goes here",
      img: "../../images/products/tshirt_red_480x400.webp",
      price: 180,
      originPrice: 200,
      discountPrice: 20,
      discountPercentage: 10,
      isNew: true,
      isHot: false,
      star: 4,
      isFreeShipping: true,
      description:
        "Nulla sodales sit amet orci eu vehicula. Curabitur metus velit, fermentum a velit ac, sodales egestas lacus. Etiam congue velit vel luctus dictum. Pellentesque at pellentesque sapien.",
    },
    {
      id: 2,
      sku: "FAS-02",
      link: "/products",
      name: "Great product name goes here",
      img: "../../images/products/tshirt_grey_480x400.webp",
      price: 475,
      originPrice: 0,
      discountPrice: 0,
      discountPercentage: 0,
      isNew: false,
      isHot: true,
      star: 3,
      isFreeShipping: true,
      description:
        "Maecenas suscipit volutpat gravida. Nulla hendrerit nisi a lectus blandit aliquam. Integer enim magna, consequat sed justo nec, auctor sagittis urna.",
    },
    {
      id: 3,
      sku: "FAS-03",
      link: "/products",
      name: "Great product name goes here",
      img: "../../images/products/tshirt_black_480x400.webp",
      price: 1900,
      originPrice: 2000,
      discountPrice: 100,
      discountPercentage: 0,
      isNew: true,
      isHot: true,
      star: 2,
      isFreeShipping: true,
      description:
        "Vivamus sapien eros, molestie sed lacus vitae, lacinia volutpat ipsum. Nam sollicitudin lorem eget ornare vulputate.",
    },
    {
      id: 4,
      sku: "FAS-04",
      link: "/products",
      name: "Great product name goes here",
      img: "../../images/products/tshirt_green_480x400.webp",
      price: 10,
      originPrice: 0,
      discountPrice: 0,
      discountPercentage: 0,
      isNew: false,
      isHot: false,
      star: 0,
      isFreeShipping: false,
      description:
        "Morbi lobortis velit non consectetur porta.|Duis auctor risus ac purus vehicula tempor.|Fusce at ipsum a leo tempor malesuada.|Curabitur tincidunt justo vel volutpat suscipit.",
    },
  ],
  blogBanner: [
    {
      to: "/blog/detail",
      img: "../../images/blog/nature-1.webp",
      title: "First slide label",
      description: "Nulla vitae elit libero, a pharetra augue mollis interdum",
    },
    {
      to: "/blog/detail",
      img: "../../images/blog/nature-2.webp",
      title: "Second slide label",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      to: "/blog/detail",
      img: "../../images/blog/nature-3.webp",
      title: "Third slide label",
      description: "Praesent commodo cursus magna, vel scelerisque nisl.",
    },
  ],
  blogList: [
    {
      to: "/blog/detail",
      img: "../../images/blog/nature-1.webp",
      title:
        "It is a long established fact that a reader will be distracted by the readable content",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
      publishDate: "Jul 05, 2020",
      tags: ["Branding", "Design"],
      commentCount: 2,
    },
    {
      to: "/blog/detail",
      img: "../../images/blog/nature-2.webp",
      title:
        "Contrary to popular belief, Lorem Ipsum is not simply random text",
      description:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour",
      publishDate: "Aug 05, 2020",
      tags: ["Branding", "Design"],
      commentCount: 3,
    },
    {
      to: "/",
      img: "../../images/blog/nature-3.webp",
      title: "The standard chunk of Lorem Ipsum used since the 1500s",
      description:
        "It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.",
      publishDate: "Sep 05, 2020",
      tags: ["Branding", "Design"],
      commentCount: 4,
    },
  ],
};
