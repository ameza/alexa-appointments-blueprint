using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using App.Infrastructure;
using App.Domain;

namespace App.Controllers
{
    public class AppointmentController : Controller
    {

		private readonly App.Domain.AppSettings _appSettings;

		public AppointmentController(Microsoft.Extensions.Options.IOptions<App.Domain.AppSettings> appSettings){
            _appSettings = appSettings.Value;
        }

		public JsonResult UpdateForm(string conf)
        {
			var tempConf = conf.Split(",");
			var repo = new ConfigurationRepository(_appSettings);
			repo.UpdateConfiguration(new ConfigurationModel()
			{
				Date = tempConf[0],
                Time = tempConf[1],
                Assessor= tempConf[2]

			});

			var config = repo.GetConfiguration();

            return Json(config.ToString());
        }

		public JsonResult GetConfig(string sortBy)
        {
			var repo = new ConfigurationRepository(_appSettings);
			var config = repo.GetConfiguration();
            return Json(config.ToString());
        }


        public ActionResult Index()
        {
			var repo = new AppointmentRepository(_appSettings);
            var model = repo.GetAppointments();
            return View(model);
        }

        // GET: BlackList/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: BlackList/Create
        public ActionResult Create()
        {
            return View();
        }
  

        // GET: BlackList/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: BlackList/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, IFormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        
       
    }
}