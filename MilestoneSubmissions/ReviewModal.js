$(function () {
     
    $("#rateYo").rateYo({
   
      onSet: function (rating, rateYoInstance) {
         rating = rating;
         $('#rating_input').val(rating);
      }
    });
  });
