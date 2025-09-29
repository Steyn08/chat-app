<div>
  {/* <div className="bg-white p-2 rounded shadow-sm">
                    <img
                      src={msg?.attachment?.url}
                      alt="msg"
                      className="img-fluid rounded"
                    />
                  </div> */}

  {msg.text && (
    <div className="bg-white p-2 rounded shadow-sm">
      <span className="message-text badge text-wrap text-dark">{msg.text}</span>
    </div>
  )}

  {msg.attachments &&
    msg.attachments.map((file, idx) => {
      const fullUrl = `${API_BASE_URL}/${file}`;
      const fileExtension = getFileExtension(fullUrl); // returns 'pdf', 'docx', etc.
      const fileName = file.split("/").pop();

      const isImage = ["jpg", "jpeg", "png", "gif", "bmp"].includes(
        fileExtension
      );

      return isImage ? (
        <div key={idx} className="image-preview-wrapper">
          <img
            src={fullUrl}
            alt={fileName}
            onClick={() => openImage(fullUrl)}
            className="image-thumbnail"
          />
          <a href={fullUrl} download className="download-button">
            <FontAwesomeIcon icon={faDownload} />
          </a>
        </div>
      ) : (
        <FilePreviewCard
          key={idx}
          fullUrl={fullUrl}
          fileName={fileName}
          fileExtension={fileExtension}
        />
      );
    })}
  <div className="small text-muted mt-1 d-flex align-items-center">
    {formatDateSeparator(msg.timestamp)}
    <IconButton size="small" className="ms-1">
      <DownloadIcon fontSize="small" />
    </IconButton>
  </div>
</div>;
