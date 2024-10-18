
 let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    const totalSlides = slides.length;
    
    // Function to show the next slide
    function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % totalSlides;
      slides[currentSlide].classList.add('active');
    }
    
    // Function to show the previous slide
    function prevSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      slides[currentSlide].classList.add('active');
    }
    
    // Automatically switch slides every 3 seconds
    setInterval(nextSlide, 3000);
  