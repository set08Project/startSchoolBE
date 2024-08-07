import ResourceFormatsCards from "@/containers/Resources/components/ResourceFormatCards";
import ResourcesHeroSection from "@/containers/Resources/components/ResourcesHeroSection";
import Image from "next/image";
import React from "react";

import heroPk from "../../../../public/images/resources/hero.jpg";
const page = () => {
  return (
    <main className="min-h-[700px]">
      <ResourcesHeroSection>
        <header className="contain grid place-content-center text-center">
          <h1 className="text-3xl font-black leading-tight text-purple-850 lg:text-[4.063rem]">
            Devotional
          </h1>
          <p className="text-sm max-lg:pt-4 lg:text-lg">
            Listen to audio messages and ministarations from our pastors,
            ministers and guest ministers
          </p>
        </header>
      </ResourcesHeroSection>

      {/* Card */}

      <section className="contain mb-28">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 md:gap-y-8">
          <Image
            width={1000}
            height={1000}
            src={heroPk}
            alt=""
            className="h-[350px] w-full rounded-2xl border object-cover"
          />
        </div>
      </section>

      {/*  Other Resources */}

      <section className="contain pb-24">
        <header>
          <h2 className="pb-6 text-2xxl font-black">OTHER RESOURCES</h2>
        </header>
        <ResourceFormatsCards currentPageFormat="devotional" />
      </section>
    </main>
  );
};

export default page;
