import React, { useRef, useEffect } from "react";
import Lightbox from "react-image-lightbox";
import FilePreviewCard from "./FilePreviewCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const MessagesList = ({
  messages,
  userId,
  API_BASE_URL,
  formatDateSeparator,
  formatMessageTime,
  viewerImage,
  setViewerImage,
  viewerOpen,
  setViewerOpen,
  isGroupChat,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getFileExtension = (url) => url.split(".").pop().toLowerCase();

  // Preprocess messages for date separators and time formatting
  const processedMessages = [];
  let lastDate = null;

  messages.forEach((msg) => {
    const currentDate = new Date(msg.timestamp).toDateString();
    const showDateSeparator = lastDate !== currentDate;
    lastDate = currentDate;

    processedMessages.push({
      ...msg,
      showDateSeparator,
      dateString: currentDate,
      timeString: formatMessageTime(msg.timestamp),
    });
  });

  return (
    <div className="messages-block p-3">
      {processedMessages.map((msg) => {
        const isOwnMessage = (msg?.sender?._id || msg?.sender) === userId;
        const senderName = msg?.sender?.username || "Unknown";

        return (
          <React.Fragment key={msg?._id}>
            {msg.showDateSeparator && (
              <div className="date-separator text-center my-3">
                <span>{formatDateSeparator(msg.timestamp)}</span>
              </div>
            )}
            <div
              className={`message-container ${isOwnMessage ? "own" : "other"}`}
            >
              <div className="message-bubble">
                {!isOwnMessage && isGroupChat && (
                  <small className="sender-name d-block text-muted">
                    {senderName}
                  </small>
                )}
                {msg.text && (
                  <div className="msg-block">
                    <span className="message-text badge text-wrap">
                      {msg.text}
                    </span>
                  </div>
                )}
                {msg.attachments &&
                  msg.attachments.map((file, idx) => {
                    const fullUrl = `${API_BASE_URL}/${file}`;
                    const fileExtension = getFileExtension(fullUrl);
                    const fileName = file.split("/").pop();
                    const isImage = [
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "bmp",
                    ].includes(fileExtension);

                    return isImage ? (
                      <div key={idx} className="image-preview-wrapper">
                        <img
                          src={fullUrl}
                          alt={fileName}
                          onClick={() => {
                            setViewerImage(fullUrl);
                            setViewerOpen(true);
                          }}
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
                <small className="message-time d-block text-end text-muted">
                  {msg.timeString}
                </small>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
      {viewerOpen && (
        <Lightbox
          mainSrc={viewerImage}
          onCloseRequest={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default MessagesList;
