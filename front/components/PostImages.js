import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

import ImageZoom from "./ImageZoom";
import { backUrl } from "../config/config";

const PostImages = ({ images }) => {
  const [showImagesZoom, setShowImagesZoom] = useState(false);
  const onZoom = useCallback(() => {
    setShowImagesZoom(true);
  }, []);

  const onClose = useCallback(() => {
    setShowImagesZoom(false);
  }, []);

  if (images.length === 1) {
    return (
      <>
        <img
          role="presentation" // 웹 접근성 위해서. 굳이 누를 필요 없다고 알려주는 기능
          src={`${backUrl}/${images[0].src}`}
          alt={images[0].src}
          onClick={onZoom}
        />
        {showImagesZoom && <ImageZoom images={images} onClose={onClose} />}
      </>
    );
  }
  if (images.length === 2) {
    return (
      <>
        <img
          role="presentation" // 웹 접근성 위해서. 굳이 누를 필요 없다고 알려주는 기능
          src={`${backUrl}/${images[0].src}`}
          alt={images[0].src}
          onClick={onZoom}
          style={{ display: "inline-block", width: "50%" }}
        />
        <img
          role="presentation" // 웹 접근성 위해서. 굳이 누를 필요 없다고 알려주는 기능
          src={`${backUrl}/${images[1].src}`}
          alt={images[1].src}
          onClick={onZoom}
          style={{ display: "inline-block", width: "50%" }}
        />
        {showImagesZoom && <ImageZoom images={images} onClose={onClose} />}
      </>
    );
  }

  return (
    <>
      <div>
        <img
          role="presentation" // 웹 접근성 위해서. 굳이 누를 필요 없다고 알려주는 기능
          src={`${backUrl}/${images[0].src}`}
          alt={images[0].src}
          onClick={onZoom}
          style={{ display: "inline-block", width: "50%" }}
        />
        <div
          style={{
            display: "inline-block",
            width: "50%",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          <PlusOutlined />
          <br />
          {images.length - 1}개의 사진 더보기
        </div>
      </div>
      {showImagesZoom && <ImageZoom images={images} onClose={onClose} />}
    </>
  );
};

PostImages.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object),
};

export default PostImages;
