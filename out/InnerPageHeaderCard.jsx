import Image from "next/image";
import React from "react";

const InnerPageHeaderCard = ({ pix, title, message, headTitle }) => {
  return (
    <div className="my-10 grid grid-cols-1 gap-8 rounded-2xl border bg-white p-4 md:grid-cols-2">
      <Image
        height={1000}
        width={1000}
        src={pix}
        alt="audio message"
        className="h-[300px] w-full rounded-2xl border object-cover"
      />
      <div>
        <div className="flex">
          {" "}
          <h3 className="rounded-md bg-yellow-400 px-2 py-1 text-sm font-semibold uppercase">
            {headTitle}
          </h3>
        </div>
        <h1 className="text-5xl font-extrabold text-purple-850">{title}</h1>

        <p className="leadin">
          {message}
          <br />
          <br />
          This audio message is available for download or streaming on various
          platforms. Please note that the quality may vary depending on the
          device and network conditions.
        </p>
      </div>
    </div>
  );
};

export default InnerPageHeaderCard;
