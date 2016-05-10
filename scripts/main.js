// import PointerLock from 'react-pointerlock';

var hiddenFlag = false;

var DonutChartBox = React.createClass({
	loadChartDataFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				if (data.length < 1 || data.length > 20)
				{
					console.error("The count of Sections should be in 1 ~ 20.");
					throw new Error();
				}
				if(data.length > 8)
				{
					hiddenFlag = true;
				}
				this.setState({ data: data });
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	onMouseMove: function(e) {
		let {top, left} = $(".donut-chart").offset();
		let posX = e.nativeEvent.clientX - left;
		let posY = e.nativeEvent.clientY - top;
		console.log(posX, posY);
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		// window.addEventListener('mousemove', this.calculateMousePosition);
		this.loadChartDataFromServer();
	},
	render: function() {
		return (
			<div className="donut-chart" onMouseMove={this.onMouseMove} >
				<ChartList data={this.state.data} />
			</div>
		);
	}
});

var total = 0;
var endPortion = 0;

var ChartList = React.createClass({
	render: function() {
		this.props.data.map(function(section) {
			total += section.portion;
		});
		var sectionLabels = this.props.data.map(function(section) {
			endPortion += section.portion
			return (
				<SectionLabel key={section.id} sectionId={section.id} middlePortion={ endPortion - section.portion/2 } >
					{section.label}
				</SectionLabel>
			);
		});

		endPortion = 0;
		var sectionClips = this.props.data.map(function(section) {
			endPortion += section.portion;
			return (
				<SectionClip key={section.id} sectionId={section.id} color={section.color} portion={section.portion} endPortion={endPortion}>
					{section.portion}
				</SectionClip>
			)
		});
		return (
			<div className="label-list">
				{ sectionLabels }
				{ sectionClips }
				<div className="center"></div>
			</div>
		);
	}
});

var SectionLabel = React.createClass({
	getCoordinates(half, radius, middlePortion) {
	    var x = half - 10 + radius * Math.sin(Math.PI * 2 * middlePortion / total);
	    var y = half - 10 - radius * Math.cos(Math.PI * 2 * middlePortion / total);

		return { x, y };
	},
	render: function() {
		var middlePositionOfLabel = this.getCoordinates(100, 120, this.props.middlePortion);
		return (
			<span className={ "functional-name-" + this.props.sectionId } style={{ left: middlePositionOfLabel.x, top: middlePositionOfLabel.y, visibility: hiddenFlag ? "hidden" : "visible" }}>
				{ this.props.children.toString() }
			</span>
		);
	}
});



var SectionClip = React.createClass({
	render: function() {
		
		return (
			<div id={"section" + this.props.sectionId} className="clip" style={{transform: "rotate(" + (this.props.endPortion - this.props.portion) * 360/total + "deg)" }}>
				<div className="item" style={{background: this.props.color, transform: "rotate(" + this.props.portion * 360/total + "deg)" }} data-rel={this.props.children}></div>
			</div>
		)
	}
});

ReactDOM.render(
	<DonutChartBox url="/api/data" />,
	document.getElementById('donut-chart-block')
);