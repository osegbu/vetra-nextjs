import Image from "next/image";
import styles from "./chat.module.css";

const ImageViewer = ({ image_url, setIsOpen }) => {
  const customLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  return (
    <div className={styles.postImage}>
      <div
        className={styles.closeUploadContainer}
        onClick={() => setIsOpen(false)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="white"
          aria-hidden="true"
          style={{ marginTop: "5px" }}
        >
          <g>
            <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
          </g>
        </svg>
      </div>

      <div className={styles.imagePreviewWrapper}>
        <Image
          loader={customLoader}
          src={image_url}
          alt="Selected Image"
          width={1920}
          height={1080}
          priority
        />
      </div>
    </div>
  );
};
export default ImageViewer;
