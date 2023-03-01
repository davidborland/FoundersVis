var fileName = "data/ILR_founder_detail_NONprominentTeams.csv";

d3.csv(fileName, function(error, data) {
  if (error) throw error;

  var companyObject = {};

  data.forEach(function(d, i) {
    var history = d3.csvParse(d.History).columns;

    if (history) {
      var comps = d3.set();

      history.forEach(function(d) {
        var s = d.trim();

        if (s.length > 1 && isNaN(+s)) {
          comps.add(s.replace("&amp;", "&"));
        }
      });

      comps.values().forEach(function(d) {
        if (!companyObject.hasOwnProperty(d)) {
          companyObject[d] = 0;
        }

        companyObject[d]++;
      });
    }
  });

  var companies = [];

  for (c in companyObject) {
    companies.push({
      name: c,
      count: companyObject[c]
    });
  }

  companies.sort(function(a, b) {
    return d3.descending(a.count, b.count);
  });

  drawCompanies(companies);
});

function drawCompanies(companies) {
  console.log(companies);

  companies = companies.filter(function(d) {
    return d.count > 1;
  });

  console.log(companies);

  var font = "sans-serif";

  var sizeScale = d3.scaleSqrt()
      .domain(d3.extent(companies, function(d) {
        return d.count;
      }))
      .range([10, 100]);

  var opacityScale = d3.scaleLinear()
      .domain(sizeScale.domain())
      .range([0.4, 1]);

  var layout = d3.layout.cloud()
      .size([1200, 600])
      .words(companies)
      .padding(5)
      .font(font)
      .fontSize(function(d) { return sizeScale(d.count); })
      .text(function(d) { return d.name; })
      .rotate(0)
      .on("end", draw);

  layout.start();

  function draw(words) {
    d3.select("#founderVis").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
      .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return sizeScale(d.count) + "px"; })
        .style("font-family", font)
        //.style("fill", function(d, i) { return fill(i); })
        .style("fill-opacity", function(d) { return opacityScale(d.count); })
        .attr("data-toggle", "tooltip")
        .attr("title", function(d) { return d.count; })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on("mouseover", function(d) {
          d3.select(this)
              .style("fill", "#ca0020")
              .style("fill-opacity", 1);
        })
        .on("mouseout", function(d) {
          d3.select(this)
              .style("fill", null)
              .style("fill-opacity", function(d) { return opacityScale(d.count); });
        });

    // Enable bootstrap tooltips
    $('[data-toggle="tooltip"]').tooltip({
      container: "body",
      html: true,
      placement: "auto left",
      animation: false
    }).hover;
  }
}
