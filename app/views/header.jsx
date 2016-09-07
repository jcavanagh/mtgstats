import React from 'react';

export default class Header extends React.Component {
	render() {
		return (
			<div id="header">
				<nav className="navbar navbar-default navbar-inverse" role="navigation">
					<div className="container-fluid">
						<div className="navbar-header">
							<a className="navbar-brand" href="#">MTGStats</a>
						</div>
						<ul className="nav navbar-nav">
							<li><a data-toggle="tab" href="#charts">Charts</a></li>
							<li><a data-toggle="tab" href="#mana">Manabase</a></li>
							<li><a data-toggle="tab" href="#tracking">Match Tracking</a></li>
						</ul>
					</div>
				</nav>
			</div>
		);
	}
}