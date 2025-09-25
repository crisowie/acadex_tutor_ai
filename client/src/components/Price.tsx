import React from 'react'

interface PriceProps {
  type: string;
  amount: number;
  included: string[];
}

// Define the Price component to accept the correct props
const Price: React.FC<PriceProps> = ({ type, amount, included }) => (
  <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
    <h2 className="text-2xl font-semibold mb-4 capitalize">{type}</h2>
    <div className="text-4xl font-bold mb-6">${amount}</div>
    <ul className="mb-6 space-y-2">
      {included.map((item, idx) => (
        <li key={idx} className="text-green-800">{item}</li>
      ))}
    </ul>
    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
      Choose {type}
    </button>
  </div>
);



const prices = [
  {
    type: "starter",
    amount: 9,
    included: [
      "Basic content generation",
      "50 posts per month",
      "Post editing",
      "Hook generation",
      "1 Quiz per week",
      "2 AI models",
    ],
  },
  {
    type: "Pro",
    amount: 19,
    included: [
      "All features in Starter",
      "200 posts per month",
      "Post to LinkedIn",
      "Schedule to LinkedIn",
      "Attach media to posts",
      "Advanced AI generation",
      "AI personalization",
      "5 AI models",
      "Research trends",
    ],
  },
  {
    type: "Premium",
    amount: 39,
    included: [
      "All features in Pro",
      "Unlimited posts per month",
      "Priority support",
      "Personal branding tips",
      "Community group access",
      "Beta features access",
      "Feature suggestions",
      "Audio to post",
      "Image to post",
    ],
  },
];

const PricingSection = () => {
  return (
    <section className="bg-green-50 py-20 px-6 lg:px-32 rounded-3xl">
      <h1 className="text-4xl font-bold text-center mb-12 text-green-900">
        Choose Your Plan
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {prices.map((price, index) => (
          <Price
            key={index}
            type={price.type}
            amount={price.amount}
            included={price.included}
          />
        ))}
      </div>
    </section>
  );
};

export default PricingSection;
