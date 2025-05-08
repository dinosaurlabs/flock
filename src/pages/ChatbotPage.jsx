import React from "react";
import Chatbot from "../components/Chatbot/Chatbot";
import Typography from "../components/Typography/Typography";
import Button from "../components/Button/Button";
import { Link } from "react-router-dom";

function ChatbotPage() {
  return (
    <div className="flex flex-col gap-12 px-6 text-black pb-28 pt-28 bg-surface dark:bg-surface-dark dark:text-white">
      {/* Header Section */}
      <section className="flex flex-col gap-6">
        <Typography textStyle="display-lg">
          <span className="text-primary-light dark:text-primary-dark">
            AI Event Planner
          </span>
        </Typography>
        <Typography textStyle="body-lg" color="secondary">
          Tell our AI assistant what kind of event you're planning, and it will
          help you create the perfect scheduling setup.
        </Typography>
        <div className="flex gap-4">
          <Link to="/">
            <Button buttonSize="md" color="secondary" text="Back to Home" />
          </Link>
        </div>
      </section>

      {/* Chatbot Section */}
      <section className="flex flex-col gap-6">
        <Chatbot />
      </section>

      {/* How it works Section */}
      <section className="flex flex-col gap-6 mt-8">
        <Typography textStyle="heading-lg" color="primary-light">
          How it works
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface-variant dark:bg-surface-variant-dark rounded-xl">
            <Typography textStyle="heading-md">
              1. Describe Your Event
            </Typography>
            <Typography textStyle="body-md" color="secondary">
              Tell the AI what type of event you're planning, how many people
              are involved, and any specific requirements.
            </Typography>
          </div>
          <div className="p-6 bg-surface-variant dark:bg-surface-variant-dark rounded-xl">
            <Typography textStyle="heading-md">
              2. Get Personalized Setup
            </Typography>
            <Typography textStyle="body-md" color="secondary">
              The AI will create a custom event scheduling solution tailored to
              your needs, similar to When2Meet.
            </Typography>
          </div>
          <div className="p-6 bg-surface-variant dark:bg-surface-variant-dark rounded-xl">
            <Typography textStyle="heading-md">3. Create & Share</Typography>
            <Typography textStyle="body-md" color="secondary">
              Once your event is set up, you can share it with participants and
              track responses in one place.
            </Typography>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChatbotPage;
