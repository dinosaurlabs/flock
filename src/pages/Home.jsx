import React from "react";
import Typography from "../components/TextStyles/Typography";
import heroImage from "../assets/images/home-hero.png"
import Pablo from "../components/SVGs/Pablo/Pablo.jsx";

function Home() {
  return (
    <div className="min-h-screen text-black bg-surface dark:bg-surface-dark dark:text-white">
      {/* Hero section (Wil and Gannett) */
        <>
            <div style={{width: 200}} className="flex flex-col gap-4" property="wrap">
              
              <Typography>
                  <Typography>
                    Effortlessly
                  </Typography>
                  <Typography>
                    Organize and Meet Up in Seconds
                  </Typography>
              </Typography>
              <Typography>
                Flock lets you organize and join meetups in just a few clicks. Imagine When2Meet with a better design and user experience.
              </Typography>

              <div color="primary" className="flex">
                <button>
                  Join a Flock
                </button>
                <button>
                  Donate
                </button>
              </div>

              <Pablo style={{ }}>

              </Pablo>
              <img src={heroImage} alt="Hero image." style={{borderRadius: '15px'}}>

              </img>
          </div>
        </>
      }

    </div>
  );
}

export default Home;
