import React from 'react'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import calling from '../img/calling.png';
import sharing from '../img/sharing.png';
import chat from '../img/chatPerson3.png'
import seamless from '../img/seamless.jpg';
import groupimg from '../img/group.svg';
const cardData = [
  {
    title: "Join Meetings Instantly",
    desc: "Start or join a secure video meeting with a single click.",
    image: calling,
  },
  {
    title: "Screen Sharing",
    desc: "Share your screen with participants seamlessly.",
    image: sharing,
  },
  {
    title: "Chat in Real-Time",
    desc: "Send messages during the meeting using integrated chat.",
    image:chat,
  },
  {
    title: "Seamless Talk & Chat",
    desc: "Enjoy crystal-clear audio and smooth messaging for effortless communication.",
    image: seamless, 
  },
  {
    title:"Group Calling",
    desc:"Connect with multiple participants in a single call.",
    image: groupimg,
  }
];
export default function Carousel() {
  return (

      <Swiper
  modules={[Autoplay, Pagination]}
  autoplay={{
    delay: 3000,
    disableOnInteraction: false,
  }}
  pagination={{ clickable: true }}
  spaceBetween={20}
  breakpoints={{
    640: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
  }}
  loop={true}
  className='w-full h-full'
>
  {cardData.map((card, index) => (
    <SwiperSlide key={index}>
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-5 shadow-md h-[300px] flex flex-col justify-between">
        <img
          src={typeof card.image === 'string' ? card.image : card.image.src}
          alt={card.title}
          className="w-full h-32 object-contain mb-4"
        />
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {card.title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
          {card.desc}
        </p>
      </div>
    </SwiperSlide>
  ))}
</Swiper>

  )
}
