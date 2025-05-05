import {
  faDownload,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./FilePreviewCard.scss"

const getIconByExtension = (ext) => {
  switch (ext) {
    case "pdf":
      return faFilePdf;
    case "doc":
    case "docx":
      return faFileWord;
    case "xls":
    case "xlsx":
      return faFileExcel;
    default:
      return faFileAlt;
  }
};

const FilePreviewCard = ({
  fullUrl,
  fileName,
  fileExtension,
  fileSize = "Unknown",
}) => {
  const icon = getIconByExtension(fileExtension);

  return (
    <div className="whatsapp-preview-card">
      <div className="preview-thumbnail">
        <FontAwesomeIcon icon={icon} className="pdf-icon" />
      </div>
      <div className="preview-details">
        <div className="file-name">{fileName}</div>
        <div className="file-meta">
          .{fileExtension.toUpperCase()} • {fileSize}
        </div>
      </div>
      <div className="download-btn">
        <a href={fullUrl} download>
          <FontAwesomeIcon icon={faDownload} />
        </a>
      </div>
    </div>
  );
};

export default FilePreviewCard;
