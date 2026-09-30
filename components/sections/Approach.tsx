import { approach, laps } from "@/content/site";
import { SectionHead } from "../ui";

export default function Approach() {
  return (
    <section id="approach" className="section lane" aria-labelledby="approach-title">
      <div className="wrap">
        <SectionHead id="approach" meters={laps.approach} label="How I work">
          Find it. Understand it. Fix it — or build it again.
        </SectionHead>

        <div className="steps-wrap" data-steps>
          <span className="steps-swimmer" aria-hidden="true" data-steps-swimmer />
          <ol className="steps">
            {approach.map((step, i) => (
              <li key={step.title} className="step" data-step>
                <span className="step-no" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
