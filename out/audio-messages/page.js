import ResourcesHeroSection from "@/containers/Resources/components/ResourcesHeroSection";
import React from "react";
import heroPk from "../../../../public/images/resources/hero.jpg";
import SermonCard from "@/containers/Resources/components/SermonCard";

import { FAKE_SERMONS } from "@/utility/fakeResponse";
import Icon from "@/containers/ui/Icons";
import ResourceFormatsCards from "@/containers/Resources/components/ResourceFormatCards";

const page = () => {
  const featured = [
    {
      title: "BUT GOD...",
      author: "Pastor Mildred Kingsley-Okonkwo",
      imgUrl: heroPk,
    },
    {
      title: "POWER, MONEY & SEX",
      author: "Pastor Kingsley Okonkwo",
      imgUrl: heroPk,
    },
    {
      title: "The Only thing chasing you",
      author: "Pastor Kingsley Okonkwo",
      imgUrl: heroPk,
    },
    {
      title: "BUt GOD...",
      author: "Pastor Mildred Kingsley-Okonkwo",
      imgUrl: heroPk,
    },
  ];
  return (
    <main className="min-h-[700px]">
      <ResourcesHeroSection>
        <header className="contain grid place-content-center text-center">
          <h1 className="text-3xl font-black leading-tight text-purple-850 lg:text-[4.063rem]">
            Audio Messages
          </h1>
          <p className="text-sm max-lg:pt-4 lg:text-lg">
            Listen to audio messages and ministarations from our pastors,
            ministers and guest ministers
          </p>
          <form role="search" className="pt-8 lg:pt-14">
            <label htmlFor="search" className="sr-only">
              Search Sermons
            </label>
            <div
              style={{ boxShadow: "0 16px 36px 0 rgba(97, 8, 114, 0.1)" }}
              className="m relative mx-auto rounded-full"
            >
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search e.g faith, secrets of the kingdom... "
                className="block w-full appearance-none rounded-full py-[1.156rem] pl-6 pr-12 !text-sm leading-none text-gray-700 outline-none ring-0 ring-inset ring-purple-300 focus-visible:ring-2 active:ring-2"
              />
              <svg
                className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer"
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 0a8.5 8.5 0 1 0 5.262 15.176l3.652 3.652a1 1 0 0 0 1.414-1.414l-3.652-3.652A8.5 8.5 0 0 0 9 0ZM2.5 8.5a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z"
                  fill="#000"
                />
              </svg>
            </div>
          </form>
        </header>
      </ResourcesHeroSection>

      {/* RECENT SERIES */}
      <section className="contain">
        <header className="mb-4 lg:mb-10">
          <div className="flex items-center gap-5">
            <button className="border-b-4 border-purple-850 pb-1 font-bold">
              Messages
            </button>
            <button className="pb-1 font-bold text-gray-400">Music</button>
          </div>
        </header>
        <ul className="grid gap-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-y-8">
          {FAKE_SERMONS.slice(0, 9).map((item) => (
            <li key={item.title}>
              <SermonCard detail={item} />
            </li>
          ))}
        </ul>

        <nav
          aria-label="pagination"
          className="my-4 flex items-center justify-center gap-x-1 pt-7 lg:pt-14"
        >
          <a className="text-purple-700 opacity-50">
            <Icon type="arrow" size={20} className="-mt-0.5 scale-[-1]" />
            <span className="sr-only">Previous</span>
          </a>

          {[1, 2, 3, 4, 5, "...", 10].map((page) => (
            <a
              key={page}
              href="#"
              className="min-w-[24px] rounded-md px-1.5 pb-1 pt-1.5 text-base leading-none text-[#98A2B3] [&:nth-child(4)]:ring-purple-700 [&:nth-child(5)]:bg-purple-100 [&:nth-child(5)]:font-semibold [&:nth-child(5)]:text-purple-700 [&:nth-child(5)]:ring-1"
            >
              {page}
            </a>
          ))}
          <a className="text-purple-700">
            <Icon type="arrow" size={20} className="-mt-0.5" />
            <span className="sr-only">Next</span>
          </a>
        </nav>
      </section>

      {/*  Other Resources */}

      <section className="contain pb-24">
        <header>
          <h2 className="pb-6 text-2xxl font-black">OTHER RESOURCES</h2>
        </header>
        <ResourceFormatsCards currentPageFormat="audio" />
      </section>
    </main>
  );
};

export default page;
