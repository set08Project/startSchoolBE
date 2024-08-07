import ResourcesHeroSection from "@/containers/Resources/components/ResourcesHeroSection";
import Icon from "@/containers/ui/Icons";
import React from "react";
import pix from "../../../../../public/images/resources/hero.jpg";
import Image from "next/image";
import InnerPageHeaderCard from "@/containers/Resources/components/InnerPageHeaderCard";

const page = () => {
  const data = Array.from({ length: 8 });
  return (
    <main className="min-h-[700px]">
      <ResourcesHeroSection>
        <section className="contain">
          <a className="flex items-center gap-2 text-purple-700">
            <Icon type="arrow" size={20} className="-mt-0.5 scale-[-1]" />
            <span className="font-bold">Back</span>
          </a>

          {/* Header Card */}

          <InnerPageHeaderCard
            pix={pix}
            headTitle="Audio Message"
            title="Look & Live"
            message="This audio message is available for download or streaming on various
          platforms. Please note that the quality may vary depending on the
          device and network conditions."
          />
        </section>
      </ResourcesHeroSection>

      {/* Audio Player */}
      <section className="contain mb-10 mt-20">
        <div className="w-full">
          <div className="flex w-full justify-center">
            <div className="flex w-[70%] gap-4 rounded-3xl border p-4">
              <Image
                src={pix}
                alt="Audio Player"
                width={300}
                height={300}
                className="h-[200px] w-[200px] rounded-md bg-gray-200 object-cover"
              />

              <div className="flex w-[80%] flex-col gap-4">
                <div className="mb-10 flex gap-2">
                  <Icon type="play" size={20} />

                  <div className="flex h-[120px] w-full flex-col justify-between md:flex-row">
                    <div>
                      <p className="text-sm text-gray-700">
                        David's Christain Centre
                      </p>
                      <h3 className="text-lg font-extrabold uppercase">
                        Look & Live
                      </h3>
                    </div>

                    <p className="text-sm font-bold text-gray-300">
                      2 Hours Ago
                    </p>
                  </div>
                </div>
                {data?.map((items, i) => (
                  <container
                    key={i}
                    className="mb-2 flex items-center gap-2 border-b pb-2"
                  >
                    <Image
                      width={300}
                      height={300}
                      src={pix}
                      alt=""
                      className="h-[50px] w-[50px] rounded-md border object-cover"
                    />
                    <div className="flex w-full flex-col justify-between md:flex-row">
                      <h2 className="">
                        <span className="font-bold">Look & Live</span>
                        <span className=""> - 5th March 2024 (Part 1B)</span>
                      </h2>

                      <div className="flex gap-2 text-gray-500">
                        <div className="mt-1">
                          <Icon type="play" size={15} className="mt-1" />
                        </div>
                        <p className="">02:00:09</p>
                      </div>
                    </div>
                  </container>
                ))}

                <container className="flex w-full flex-wrap gap-2">
                  {data?.map((item, i) => (
                    <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
                      <Icon type="share" size={15} />
                      <p>Share</p>
                    </div>
                  ))}
                </container>

                <div className="my-4 flex w-full justify-center">
                  <Icon type={"share"} size={15} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-[400px] w-full bg-[#f7f7f7] p-8">
        <section className="contain grid h-full grid-cols-1 gap-4 md:grid-cols-5">
          <div className="col-span-1 h-[300px] md:col-span-2">
            <div className="mb-6 flex items-end gap-3 text-purple-700">
              <Icon type="audio" className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Audio Message</h1>
            </div>
            <p className="text-5xl font-semibold">
              Listen or download this sermon's Audio message
            </p>
          </div>
          <div className="col-span-1 h-[300px] md:col-span-3">
            <Image
              src={pix}
              alt=""
              width={300}
              height={300}
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        </section>
      </section>
    </main>
  );
};

export default page;
