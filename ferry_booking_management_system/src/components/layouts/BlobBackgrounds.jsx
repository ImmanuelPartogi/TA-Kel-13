import React from 'react';

const BlobBackgrounds = () => {
  return (
    <div className="blob-wrapper">
      <div className="absolute opacity-10 right-0 top-10">
        <svg
          className="animate-morph-slow"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 400 }}
        >
          <path
            fill="#3aa3ff"
            d="M48.2,-71.1C59.4,-61.9,63.6,-43.1,67.2,-25.7C70.9,-8.4,74,7.6,69.7,20.8C65.4,33.9,53.6,44.2,40.9,52.8C28.1,61.4,14.1,68.3,-1.2,69.9C-16.5,71.5,-33,67.7,-46.9,59C-60.8,50.3,-72.1,36.7,-75.6,21.3C-79.1,6,-74.9,-11.1,-65.8,-23.2C-56.6,-35.3,-42.5,-42.6,-29.6,-51.2C-16.6,-59.8,-4.9,-69.8,8.9,-74.9C22.7,-80,45.5,-80.2,48.2,-71.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className="absolute opacity-10 left-0 bottom-0">
        <svg
          className="animate-drift"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 350 }}
        >
          <path
            fill="#4470f4"
            d="M45,-54.3C55.6,-45.4,60.2,-28.4,63.3,-11.3C66.4,5.9,68,23.1,60.9,35.6C53.9,48.1,38.2,55.8,22.3,60.5C6.4,65.3,-9.7,67.1,-26.4,63.7C-43.1,60.2,-60.3,51.6,-67.9,37.2C-75.4,22.8,-73.3,2.6,-68.4,-15.7C-63.5,-34,-55.8,-50.4,-43.2,-58.7C-30.6,-67,-15.3,-67.2,0.9,-68.4C17.2,-69.5,34.4,-63.2,45,-54.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      <div className="absolute opacity-10 bottom-40 right-1/4">
        <svg
          className="animate-waves"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: 250 }}
        >
          <path
            fill="#5e8eff"
            d="M48.6,-58.3C62.3,-49.4,72.6,-33.6,76.3,-16.3C80.1,1.1,77.3,19.9,68.4,33.5C59.5,47.2,44.6,55.6,28.7,62.5C12.9,69.4,-4,74.8,-19.1,71.3C-34.2,67.8,-47.6,55.6,-57.2,40.8C-66.8,26.1,-72.6,8.8,-71.2,-7.9C-69.8,-24.6,-61.3,-40.5,-48.4,-49.8C-35.6,-59.1,-18.3,-61.7,-0.3,-61.3C17.7,-60.9,34.8,-67.3,48.6,-58.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
};

export default BlobBackgrounds;