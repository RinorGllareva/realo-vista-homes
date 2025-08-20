import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ContactPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add email functionality here if needed
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Simple form handling - you can integrate with EmailJS or other services
    console.log('Form submitted:', Object.fromEntries(formData));
    alert("Faleminderit për kontaktin! Do t'ju përgjigjemi së shpejti.");
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-32 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 py-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Email, call, or complete the form to share your property details with us.
              </p>
              <div className="space-y-2">
                <p className="text-foreground">
                  <strong>Email:</strong> rinesagllareva@gmail.com
                </p>
                <p className="text-foreground">
                  <strong>Phone:</strong> +383-49-262-282
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Customer Support</h3>
                <p className="text-muted-foreground">
                  Ne jemi në dispozicion gjatë gjithë kohës për të adresuar çdo shqetësim që mund të keni.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Feedback and Suggestions</h3>
                <p className="text-muted-foreground">
                  Komentet tuaja janë të vlefshme për të na ndihmuar të përmirësojmë shërbimet tona.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Media Inquiries</h3>
                <p className="text-muted-foreground">
                  Për pyetje në lidhje me median, ju lutemi na kontaktoni në rinesagllareva@gmail.com.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">Mund të na kontaktoni në çdo kohë</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-real-estate-secondary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-real-estate-secondary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-real-estate-secondary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-real-estate-secondary focus:border-transparent resize-vertical"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-real-estate-primary hover:bg-real-estate-primary/90 text-real-estate-secondary font-medium py-3 px-6 rounded-md transition-colors"
              >
                Submit
              </button>
            </form>
            
            <p className="text-xs text-muted-foreground text-center mt-6">
              By contacting us, you agree to our{" "}
              <a href="/terms" className="text-real-estate-secondary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-real-estate-secondary hover:underline">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;